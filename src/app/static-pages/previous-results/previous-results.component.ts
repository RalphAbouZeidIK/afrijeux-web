import { Component, OnInit } from '@angular/core';
import { GamesService } from 'src/app/services/games.service';

interface TicketSearchResult {
  GameName: string;
  IsCanceled: boolean;
  IsGenerated: boolean;
  IsPaid: boolean;
  IsWinning: boolean;
  Payout: number;
  Stake: number;
  GameEventDate: string;
  EventName: string;
  TotalPicks: number;
  WonPicks: number;
  LostPicks: number;
}

@Component({
  selector: 'app-previous-results',
  standalone: false,
  templateUrl: './previous-results.component.html',
  styleUrls: ['./previous-results.component.scss']
})
export class PreviousResultsComponent implements OnInit {
  imgGroup = 'assets/images/search-icon.svg';
  cardTopPattern = 'assets/images/previous-draw.png';

  results: Array<any> = [];
  searchResult: TicketSearchResult | null = null;
  showSearchPopup = false;
  isSearching = false;
  searchError = '';

  constructor(private gamesSrv: GamesService) {
    this.results = [
      { id: 1, name: 'Pick 2', date: 'Yesterday 1:00 PM', numbers: [7, 2], prize: '₦4.12M' },
      { id: 2, name: 'Pick 3', date: 'Yesterday 1:00 PM', numbers: [7, 2, 5], prize: '₦11.23M' },
      { id: 3, name: 'Pick 4', date: 'Yesterday 1:00 PM', numbers: [7, 2, 5, 9], prize: '₦7.89M' },
      { id: 4, name: 'Jackpot', date: 'Yesterday 1:00 PM', numbers: [7, 2, 5, 9, 3, 8], prize: '₦15.67M' }
    ];
  }

  ngOnInit(): void {
    this.getPreviousResults();
  }

  async getPreviousResults() {
    this.results = await this.gamesSrv.getPreviousResults();
    console.log(this.results)
  }

  // placeholder for search/filter logic
  async onSearch(value: string) {
    const ticketValue = value?.trim();
    if (!ticketValue || this.isSearching) {
      return;
    }

    this.isSearching = true;
    this.searchError = '';

    try {
      const apiResponse = await this.gamesSrv.checkTicket(ticketValue);
      const parsed = this.normalizeSearchResponse(apiResponse);
      console.log('checkTicket response', apiResponse, 'parsed', parsed);
       this.searchResult = apiResponse[0];
     

      this.showSearchPopup = true;
    } catch (error) {
      console.error('checkTicket failed', error);
      this.searchResult = null;
      this.searchError = 'Unable to fetch ticket details right now. Please try again.';
      this.showSearchPopup = true;
    } finally {
      this.isSearching = false;
    }

  }

  async onFilterChange(option: string) {
    console.log('filter', option);
  }

  getResultBalls(result: any): Array<{ number: number | string }> {
    if (Array.isArray(result?.numbers)) {
      return result.numbers.map((item: any) => {
        if (item && typeof item === 'object' && 'number' in item) {
          return { number: item.number };
        }

        const parsed = Number(item);
        return { number: Number.isNaN(parsed) ? item : parsed };
      });
    }

    const rawBalls = result?.Balls || result?.balls;
    if (!rawBalls) {
      return [];
    }

    return rawBalls
      .toString()
      .replace('Balls:', '')
      .replace(/'/g, '')
      .split(',')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)
      .map((item: string) => {
        const parsed = Number(item);
        return { number: Number.isNaN(parsed) ? item : parsed };
      });
  }

  closeSearchPopup(): void {
    this.showSearchPopup = false;
  }

  getSearchStatusLabel(result: TicketSearchResult | null): string {
    if (!result) {
      return '';
    }

    if (result.IsCanceled) {
      return 'Canceled';
    }

    if (result.IsWinning) {
      return 'Won';
    }

    if (result.IsGenerated && !result.IsPaid) {
      return 'Lost';
    }

    return 'Pending';
  }

  getSearchStatusClass(result: TicketSearchResult | null): string {
    if (!result) {
      return 'is-pending';
    }

    if (result.IsCanceled) {
      return 'is-canceled';
    }

    if (result.IsWinning) {
      return 'is-won';
    }

    if (result.IsGenerated && !result.IsPaid) {
      return 'is-lost';
    }

    return 'is-pending';
  }

  getTicketSummary(result: TicketSearchResult | null): string {
    if (!result) {
      return '';
    }

    const ticketLabel = result.TotalPicks === 1 ? 'Ticket' : 'Tickets';
    return `${result.TotalPicks} ${ticketLabel} ${result.WonPicks} Won`;
  }

  getFormattedGameDate(dateValue: string | null | undefined): string {
    if (!dateValue) {
      return 'N/A';
    }

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(parsedDate);
  }

  getFormattedCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '0';
    }

    return new Intl.NumberFormat('en-US').format(Number(value));
  }

  private normalizeSearchResponse(apiResponse: any): TicketSearchResult | null {
    const candidate = apiResponse?.Data || apiResponse?.data || apiResponse?.Result || apiResponse?.result || apiResponse;

    if (!candidate || typeof candidate !== 'object') {
      return null;
    }

    if (!('GameName' in candidate) || !('GameEventDate' in candidate)) {
      return null;
    }

    return {
      GameName: String(candidate.GameName || ''),
      IsCanceled: Boolean(candidate.IsCanceled),
      IsGenerated: Boolean(candidate.IsGenerated),
      IsPaid: Boolean(candidate.IsPaid),
      IsWinning: Boolean(candidate.IsWinning),
      Payout: Number(candidate.Payout || 0),
      Stake: Number(candidate.Stake || 0),
      GameEventDate: String(candidate.GameEventDate || ''),
      EventName: String(candidate.EventName || ''),
      TotalPicks: Number(candidate.TotalPicks || 0),
      WonPicks: Number(candidate.WonPicks || 0),
      LostPicks: Number(candidate.LostPicks || 0)
    };
  }
}
