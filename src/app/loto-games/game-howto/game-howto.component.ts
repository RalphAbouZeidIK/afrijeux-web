import { Component, Input, OnInit } from '@angular/core';

// illustration asset from Figma
const IMG_FLOW =
  '/assets/images/how-to-icon.svg';

@Component({
  selector: 'app-game-howto',
  standalone:false,
  templateUrl: './game-howto.component.html',
  styleUrls: ['./game-howto.component.scss'],
})
export class GameHowtoComponent implements OnInit {
  @Input() title: string = 'How to Play';
  @Input() steps: string[] = [];
  @Input() imageUrl: string = IMG_FLOW;

  constructor() {}

  ngOnInit(): void {}
}
