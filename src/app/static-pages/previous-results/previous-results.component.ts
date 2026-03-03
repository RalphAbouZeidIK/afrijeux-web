import { Component } from '@angular/core';

@Component({
  selector: 'app-previous-results',
  standalone: false,
  templateUrl: './previous-results.component.html',
  styleUrls: ['./previous-results.component.scss']
})
export class PreviousResultsComponent {
  imgGroup = 'https://www.figma.com/api/mcp/asset/a3767546-57b5-49d4-b8fa-9cebebadb74c';
  imgPolygon1 = 'https://www.figma.com/api/mcp/asset/530d6a5d-dc3d-403b-80f8-52ac6ab04311';
  cardTopPattern = 'assets/images/previous-draw.png';

  results: Array<any> = [];

  constructor() {
    this.results = [
      { id: 1, name: 'Pick 2', date: 'Yesterday 1:00 PM', numbers: [7, 2], prize: '₦4.12M' },
      { id: 2, name: 'Pick 3', date: 'Yesterday 1:00 PM', numbers: [7, 2, 5], prize: '₦11.23M' },
      { id: 3, name: 'Pick 4', date: 'Yesterday 1:00 PM', numbers: [7, 2, 5, 9], prize: '₦7.89M' },
      { id: 4, name: 'Jackpot', date: 'Yesterday 1:00 PM', numbers: [7, 2, 5, 9, 3, 8], prize: '₦15.67M' }
    ];
  }

  // placeholder for search/filter logic
  onSearch(value: string) {
    console.log('search ticket', value);
  }

  onFilterChange(option: string) {
    console.log('filter', option);
  }
}
