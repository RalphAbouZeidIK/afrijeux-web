import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-tickets',
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent implements OnInit {

  tickets: any[] = [];
  filteredTickets: any[] = [];
  expandedTicketIds: Set<string> = new Set<string>();
  activeFilter: 'all' | 'won' | 'lost' | 'pending' = 'all';
  searchTerm = '';

  constructor(private gamesSrv: GamesService) { }

  ngOnInit(): void {
    this.getTickets()
  }

  async getTickets() {
    let apiResponse: any;
    apiResponse = await this.gamesSrv.getTickets();
    this.tickets = this.extractTicketList(apiResponse).map((ticket: any, index: number) => ({
      ...ticket,
      _ticketUiId: String(ticket?.TicketId ?? ticket?.ticketId ?? ticket?.TicketCode ?? index),
      _subTickets: this.extractSubTickets(ticket)
    }));
    this.applyFilters();
  }

  setFilter(filter: 'all' | 'won' | 'lost' | 'pending'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  toggleTicket(ticket: any): void {
    const ticketId = ticket?._ticketUiId;
    if (!ticketId) {
      return;
    }
    if (this.expandedTicketIds.has(ticketId)) {
      this.expandedTicketIds.delete(ticketId);
      return;
    }
    this.expandedTicketIds.add(ticketId);
  }

  isExpanded(ticket: any): boolean {
    return this.expandedTicketIds.has(ticket?._ticketUiId);
  }

  getTicketLabel(ticket: any): string {
    const ticketId = ticket?.TicketId ?? ticket?.ticketId ?? ticket?.TicketCode ?? ticket?.FullTicketId;
    return ticketId != null ? String(ticketId) : '-';
  }

  getTicketDate(ticket: any): string {
    const value = ticket?.PurchaseDate ?? ticket?.CreatedDate ?? ticket?.DateIssued ?? ticket?.IssueDate ?? ticket?.CreatedAt;
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getTicketStatus(ticket: any): 'won' | 'lost' | 'pending' {
    const rawStatus = String(ticket?.Status ?? ticket?.TicketStatus ?? '').toLowerCase();
    if (ticket?.IsWinning === 1 || rawStatus.includes('won') || Number(ticket?.WinningAmount ?? 0) > 0) {
      return 'won';
    }
    if (ticket?.IsPending === 1 || rawStatus.includes('pending')) {
      return 'pending';
    }
    if (ticket?.IsWinning === 0 || rawStatus.includes('lost') || rawStatus.includes('lose')) {
      return 'lost';
    }
    return 'pending';
  }

  getTicketStatusLabel(ticket: any): string {
    const status = this.getTicketStatus(ticket);
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getTicketWinningAmount(ticket: any): number {
    return Number(ticket?.WinningAmount ?? ticket?.WonAmount ?? ticket?.Payout ?? 0) || 0;
  }

  getSubTicketNumbers(subTicket: any): any[] {
    const numbers = subTicket?.Numbers ?? subTicket?.numbers ?? subTicket?.SelectedNumbers ?? subTicket?.DrawNumbers;
    if (Array.isArray(numbers)) {
      return numbers;
    }
    if (typeof numbers === 'string') {
      return numbers.split(',').map((n: string) => n.trim()).filter((n: string) => n !== '');
    }
    const gamePick = subTicket?.GamePick ?? subTicket?.gamePick;
    if (Array.isArray(gamePick)) {
      return gamePick
        .map((pick: any) => pick?.Number ?? pick?.Value ?? pick?.PickValue)
        .filter((value: any) => value !== undefined && value !== null);
    }
    return [];
  }

  getSubTicketStatus(subTicket: any): 'won' | 'lost' | 'pending' {
    const rawStatus = String(subTicket?.Status ?? subTicket?.TicketStatus ?? '').toLowerCase();
    if (subTicket?.IsWinning === 1 || rawStatus.includes('won') || Number(subTicket?.WinningAmount ?? 0) > 0) {
      return 'won';
    }
    if (subTicket?.IsPending === 1 || rawStatus.includes('pending')) {
      return 'pending';
    }
    if (subTicket?.IsWinning === 0 || rawStatus.includes('lost') || rawStatus.includes('lose')) {
      return 'lost';
    }
    return 'pending';
  }

  getSubTicketStatusLabel(subTicket: any): string {
    const status = this.getSubTicketStatus(subTicket);
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getSubTicketWinningAmount(subTicket: any): number {
    return Number(subTicket?.WinningAmount ?? subTicket?.WonAmount ?? subTicket?.Payout ?? 0) || 0;
  }

  trackByTicket = (_: number, ticket: any) => ticket?._ticketUiId;

  trackBySubTicket = (index: number, subTicket: any) => subTicket?.SubTicketId ?? subTicket?.TicketId ?? index;

  private applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredTickets = this.tickets.filter((ticket: any) => {
      const ticketId = this.getTicketLabel(ticket).toLowerCase();
      const matchesSearch = term === '' || ticketId.includes(term);
      const matchesFilter = this.activeFilter === 'all' || this.getTicketStatus(ticket) === this.activeFilter;
      return matchesSearch && matchesFilter;
    });
  }

  private extractTicketList(apiResponse: any): any[] {
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    }
    if (Array.isArray(apiResponse?.Data)) {
      return apiResponse.Data;
    }
    if (Array.isArray(apiResponse?.data)) {
      return apiResponse.data;
    }
    if (Array.isArray(apiResponse?.Tickets)) {
      return apiResponse.Tickets;
    }
    if (Array.isArray(apiResponse?.tickets)) {
      return apiResponse.tickets;
    }
    return [];
  }

  private extractSubTickets(ticket: any): any[] {
    const subTickets =
      ticket?.SubTickets
      ?? ticket?.subTickets
      ?? ticket?.TicketDetails
      ?? ticket?.ticketDetails
      ?? ticket?.Details
      ?? ticket?.details;
    return Array.isArray(subTickets) ? subTickets : [];
  }

}
