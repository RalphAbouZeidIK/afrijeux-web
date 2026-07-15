import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MachineService } from 'src/app/services/machine.service';

interface TicketHistoryItem {
  Game: string;
  FullTicketId: string;
  IsPrinted: number;
  IsCanceled: number;
  IsFlaggedToCancel: number;
  IsPaid: number;
  Stake: number;
  MachineDateIssued: string;
}

@Component({
  selector: 'app-tickets-history',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './tickets-history.component.html',
  styleUrl: './tickets-history.component.scss'
})
export class TicketsHistoryComponent implements OnInit {
  tickets: TicketHistoryItem[] = [];
  isLoading = true;
  searchTicketId = '';
  cancelPermissions: { [gameId: string]: boolean } = {};
  cancelingTicketId: string | null = null;
  flagToCancelTimer = 0;
  ticketPendingCancel: TicketHistoryItem | null = null;
  cancelErrorMessage: string | null = null;

  constructor(private machineSrv: MachineService) { }

  async ngOnInit() {
    this.getTicketsHistory();
    this.flagToCancelTimer = await this.machineSrv.getMachinePermission('FlagToCancelTimer', null, 'IntValue');
  }

  async getTicketsHistory() {
    this.isLoading = true;
    const ticketsHistory = await this.machineSrv.getTicketsHistory();
    this.tickets = ticketsHistory?.data ?? [];
    console.log(this.tickets)
    this.isLoading = false;
    await this.loadCancelPermissions();
  }

  async loadCancelPermissions() {
    const gameIds = [...new Set(this.tickets.map(ticket => ticket.FullTicketId?.substring(0, 3)))];
    for (const gameId of gameIds) {
      this.cancelPermissions[gameId] = await this.machineSrv.getMachinePermission('TerminalCanFlagToCancel', Number(gameId));
    }
  }

  canCancel(ticket: TicketHistoryItem): boolean {
    const gameId = ticket.FullTicketId?.substring(0, 3);
    const status = this.getStatus(ticket);
    return status !== 'canceled' && status !== 'flagged' && status !== 'paid' && status !== 'not-printed' && !!this.cancelPermissions[gameId] && this.isWithinCancelWindow(ticket);
  }

  isWithinCancelWindow(ticket: TicketHistoryItem): boolean {
    if (!this.flagToCancelTimer) {
      return true;
    }
    const elapsedMinutes = (Date.now() - new Date(ticket.MachineDateIssued).getTime()) / 60000;
    return elapsedMinutes <= this.flagToCancelTimer;
  }

  getStatus(ticket: TicketHistoryItem): 'canceled' | 'paid' | 'flagged' | 'printed' | 'not-printed' {
    if (ticket.IsCanceled === 1) {
      return 'canceled';
    }
    if (ticket.IsPaid === 1 && ticket.IsPrinted === 1) {
      return 'paid';
    }
    if (ticket.IsFlaggedToCancel === 1) {
      return 'flagged';
    }
    if (ticket.IsPrinted === 0) {
      return 'not-printed';
    }
    return 'printed';
  }

  getStatusLabel(ticket: TicketHistoryItem): string {
    const status = this.getStatus(ticket);
    if (status === 'not-printed') {
      return 'Not Printed';
    }
    if (status === 'flagged') {
      return 'Requested to Cancel';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  requestCancelTicket(ticket: TicketHistoryItem) {
    if (!this.isWithinCancelWindow(ticket)) {
      this.cancelErrorMessage = 'The time allowed to flag this ticket to cancel has expired.';
      return;
    }
    this.ticketPendingCancel = ticket;
  }

  async confirmCancelTicket() {
    const ticket = this.ticketPendingCancel;
    if (!ticket) {
      return;
    }
    this.ticketPendingCancel = null;

    this.cancelingTicketId = ticket.FullTicketId;
    let params = {
      fullTicketId: ticket.FullTicketId,
      IsLatest: false
    }
    let cancelTicketResponse = await this.machineSrv.cancelTicket(params)
    console.log('Cancel Ticket Response:', cancelTicketResponse);
    if (cancelTicketResponse?.status) {
      this.getTicketsHistory();
    }
    this.cancelingTicketId = null;
  }

  dismissCancelDialog() {
    this.ticketPendingCancel = null;
    this.cancelErrorMessage = null;
  }

  get totalTickets(): number {
    return this.tickets.length;
  }

  onSearchTicketIdChange(value: string) {
    this.searchTicketId = value.replace(/\D/g, '').slice(0, 24);
  }

  get filteredTickets(): TicketHistoryItem[] {
    const search = this.searchTicketId;
    if (!search) {
      return this.tickets;
    }
    return this.tickets.filter(ticket => ticket.FullTicketId?.toLowerCase().includes(search));
  }

  get totalStake(): number {
    return this.tickets.reduce((sum, ticket) => sum + (ticket.Stake ?? 0), 0);
  }

  trackByTicket = (_: number, ticket: TicketHistoryItem) => ticket.FullTicketId;

}
