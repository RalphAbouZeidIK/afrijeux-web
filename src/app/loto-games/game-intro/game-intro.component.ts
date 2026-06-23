import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-game-intro',
  standalone: false,
  templateUrl: './game-intro.component.html',
  styleUrl: './game-intro.component.scss'
})
export class GameIntroComponent {
  @Input() title: string = 'Pick 2 – Game Rules';
  @Input() description = 'Below you will find a step-by-step guide on how to play the game.'
}
