import { Component, OnInit } from '@angular/core';
import { GamesService } from 'src/app/services/games.service';

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
    console.log('search ticket', value);
    let apiResponse = await this.gamesSrv.checkTicket(value);
    console.log(apiResponse)

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
}
