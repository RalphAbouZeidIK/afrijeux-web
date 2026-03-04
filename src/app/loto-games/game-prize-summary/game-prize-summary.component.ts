import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-prize-summary',
  templateUrl: './game-prize-summary.component.html',
  styleUrls: ['./game-prize-summary.component.scss'],
  standalone: false
})
export class GamePrizeSummaryComponent implements OnInit {
  @Input() title: string = 'Prize Structure Summary';
  @Input() summaryLines: string[] = [];
  @Input() imageUrl: string = '/assets/images/prize-icon.svg';

  constructor() {}

  ngOnInit(): void {}
}
