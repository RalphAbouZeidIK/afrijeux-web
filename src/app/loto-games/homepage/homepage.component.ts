import { Component } from '@angular/core';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {

  overviewParagraphs: string[] = [
    'Pick 2 is a simple and exciting lottery-style game where players select a two-digit combination (each digit from 0 to 9). The game allows repetition of digits.',
    'Players may place bets using several play types: Straight, Rumble, Chance, or Reverse Straight. Each type has its own rules and payout structure.'
  ];

}

