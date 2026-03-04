import { Component, Input, OnInit } from '@angular/core';

// Asset from Figma design
const IMG_EYE_ICON =
  '/assets/images/overview-icon.svg';

@Component({
  selector: 'app-game-overview',
  standalone:false,
  templateUrl: './game-overview.component.html',
  styleUrls: ['./game-overview.component.scss'],
})
export class GameOverviewComponent implements OnInit {
  @Input() title: string = 'Overview';
  @Input() paragraphs: string[] = [];
  @Input() imageUrl: string = IMG_EYE_ICON;

  constructor() {}

  ngOnInit(): void {}
}
