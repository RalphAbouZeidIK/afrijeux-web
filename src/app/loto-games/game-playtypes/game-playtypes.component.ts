import { Component, Input, OnInit } from '@angular/core';

export interface PlayTypeRule {
  name: string;
  description: string[]; // multiple lines
}

@Component({
  selector: 'app-game-playtypes',
  standalone:false,
  templateUrl: './game-playtypes.component.html',
  styleUrls: ['./game-playtypes.component.scss'],
})
export class GamePlaytypesComponent implements OnInit {
  @Input() title: string = 'Play Types and Rules';
  @Input() subtitle: string = '';
  @Input() rules: PlayTypeRule[] = [];

  constructor() {}

  ngOnInit(): void {}
}
