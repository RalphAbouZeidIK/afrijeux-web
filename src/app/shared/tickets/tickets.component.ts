import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesService } from 'src/app/services/games.service';
import { SharedModule } from "../shared.module";

@Component({
  selector: 'app-tickets',
  imports: [CommonModule, FormsModule, SharedModule],
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

  async getTicketPicks(ticket: any): Promise<any[]> {
    if (!ticket?.TicketId) {
      return [];
    }
    try {
      const apiResponse = await this.gamesSrv.getTicketPicks(ticket.TicketId);
      return Array.isArray(apiResponse) ? apiResponse : [];
    }
    catch (error) {
      console.error('Error fetching ticket picks:', error);
      return [];
    }
  }

  setFilter(filter: 'all' | 'won' | 'lost' | 'pending'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  async toggleTicket(ticket: any): Promise<void> {
    if (!ticket._subTickets || ticket._subTickets.length === 0) {
      let picksList = await this.getTicketPicks(ticket);
      //console.log(picksList)
      ticket._subTickets = picksList.length > 0 ? picksList : this.extractSubTickets(ticket);
      //console.log('Sub-tickets for ticket', ticket._ticketUiId, ':', ticket._subTickets);
    }
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
    const eventName = ticket?.Name
    const FullTicketId = ticket?.FullTicketId;
    let fullTicketLabel = `Event: ${eventName} <br> Ticket ID: ${FullTicketId}`;
    return fullTicketLabel;
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
    let returnedNumbers: any = []
    returnedNumbers = subTicket?.Balls
      .split(',')
      .map((n: string) => n.trim())
      .filter((n: string) => n !== '')
      .map((n: string) => ({ number: Number(n) }));
    //console.log(returnedNumbers)
    return returnedNumbers;
  }

  getSubTicketStatus(subTicket: any): 'won' | 'lost' | 'pending' {
    const rawStatus = String(subTicket?.Status ?? subTicket?.TicketStatus ?? '').toLowerCase();
    if (subTicket?.IsWinning === 1 || rawStatus.includes('won') || Number(subTicket?.WinningAmount ?? 0) > 0) {
      return 'won';
    }
    if (subTicket?.IsGenerated === 0 || rawStatus.includes('pending')) {
      return 'pending';
    }
    if (subTicket?.IsWinning === 0 || rawStatus.includes('lost') || rawStatus.includes('lose')) {
      return 'lost';
    }
    return 'pending';
  }

  getSubTicketStatusLabel(subTicket: any): string {
    //console.log(subTicket)
    const status = this.getSubTicketStatus(subTicket);
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getSubTicketWinningAmount(subTicket: any): number {
    return Number(subTicket?.WinningAmount ?? subTicket?.WonAmount ?? subTicket?.Payout ?? 0) || 0;
  }

  trackByTicket = (_: number, ticket: any) => ticket?._ticketUiId;

  trackBySubTicket = (index: number, subTicket: any) => subTicket?.SubTicketId ?? subTicket?.TicketId ?? index;

  copyTicketId(ticketId: string, event: Event): void {
    event.stopPropagation();
    if (!ticketId) {
      return;
    }

    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ticketId).then(() => {
        //console.log('Ticket ID copied:', ticketId);
      }).catch((err) => {
        console.error('Failed to copy ticket ID:', err);
        this.copyViaExecCommand(ticketId);
      });
    } else {
      // Fallback for older browsers
      this.copyViaExecCommand(ticketId);
    }
  }

  private copyViaExecCommand(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      //console.log('Ticket ID copied (fallback):', text);
    } catch (err) {
      console.error('Failed to copy ticket ID:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  }

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
