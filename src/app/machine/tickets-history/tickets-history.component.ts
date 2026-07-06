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

  constructor(private machineSrv: MachineService) { }

  ngOnInit() {
    this.getTicketsHistory();
  }

  async getTicketsHistory() {
    this.isLoading = true;
    const ticketsHistory = await this.machineSrv.getTicketsHistory();
    console.log('Tickets History:', ticketsHistory);
    this.tickets = ticketsHistory?.data ?? [];
    this.isLoading = false;
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
