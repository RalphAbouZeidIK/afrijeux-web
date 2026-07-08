import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MachineService } from 'src/app/services/machine.service';

interface TicketHistoryItem {
  Game: string;
  FullTicketId: string;
  IsPrinted: number;
  IsCanceled: number;
  Stake: number;
  MachineDateIssued: string;
}

@Component({
  selector: 'app-tickets-history',
  imports: [CommonModule, FormsModule],
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

  constructor(private machineSrv: MachineService) { }

  async ngOnInit() {
    this.getTicketsHistory();
    this.flagToCancelTimer = await this.machineSrv.getMachinePermission('FlagToCancelTimer', null, 'IntValue');
  }

  async getTicketsHistory() {
    this.isLoading = true;
    const ticketsHistory = await this.machineSrv.getTicketsHistory();
    this.tickets = ticketsHistory?.data ?? [];
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
    return this.getStatus(ticket) !== 'canceled' && !!this.cancelPermissions[gameId] && this.isWithinCancelWindow(ticket);
  }

  isWithinCancelWindow(ticket: TicketHistoryItem): boolean {
    if (!this.flagToCancelTimer) {
      return true;
    }
    const elapsedMinutes = (Date.now() - new Date(ticket.MachineDateIssued).getTime()) / 60000;
    return elapsedMinutes <= this.flagToCancelTimer;
  }

  getStatus(ticket: TicketHistoryItem): 'canceled' | 'printed' | 'not-printed' {
    if (ticket.IsCanceled === 1) {
      return 'canceled';
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
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  async cancelTicket(ticket: TicketHistoryItem) {
    if (!this.isWithinCancelWindow(ticket)) {
      alert('The time allowed to flag this ticket to cancel has expired.');
      return;
    }

    if (!confirm('Are you sure you want to flag this ticket to cancel?')) {
      return;
    }

    this.cancelingTicketId = ticket.FullTicketId;
    let params = {
      fullTicketId: ticket.FullTicketId,
      IsLatest: true
    }
    let cancelTicketResponse = await this.machineSrv.cancelTicket(params)
    if (cancelTicketResponse?.status) {
      ticket.IsCanceled = 1;
    }
    this.cancelingTicketId = null;
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
