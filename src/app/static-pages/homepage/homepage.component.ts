import { Component } from '@angular/core';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {
  showGameSelection = false;

  frame35 = 'https://www.figma.com/api/mcp/asset/9835aaaf-f769-4db4-a13c-0d68737608ff';
  frame36 = 'https://www.figma.com/api/mcp/asset/e295a1b4-1036-42d4-9bef-73f5b5f9df31';
  gameBoxPattern = 'https://www.figma.com/api/mcp/asset/cd1e5b12-a132-482c-bff2-efb73f4188e1';

  games: Array<any> = [];

  previousDrawResults = [
    { id: 1, name: 'Pick 2', results: [2, 5], prize: '₦1.13M', timeRemaining: '01:37:03' },
    { id: 2, name: 'Pick 3', results: [1, 6, 8], prize: '₦1.23M', timeRemaining: '01:37:03' },
    { id: 3, name: 'Pick 4', results: [3, 5, 7, 9], prize: '₦7.8M', timeRemaining: '01:37:03' },
    { id: 4, name: 'Jackpot', results: [2, 4, 6, 8, 9], prize: '₦15.6M', timeRemaining: '01:37:03' }
  ];


  howToPlaySteps = [
    {
      title: 'Choose Your Type',
      description: 'Fixed bets using unique patterns. Numbers, multiples & permutations for more chances to win.',
      icon: 'goal'
    },
    {
      title: 'Pick Your Numbers',
      description: 'Exciting ways to play, select distinct numbers today based on the bet you\'ve selected.',
      icon: 'goal'
    },
    {
      title: 'Play to Win',
      description: 'For each results, not the games on an order pages based on detailed patterns to improve your experience.',
      icon: 'goal'
    }
  ];

  constructor() {
    // initialize games with icon references
    this.games = [
      { id: 1, name: 'PICK 2', prize: '₦3.65M', timeRemaining: '01:37:03', label: 'Today', frameIcon: this.frame35 },
      { id: 2, name: 'PICK 3', prize: '₦10.4M', timeRemaining: '01:37:03', label: 'Saturday 7:15 PM', frameIcon: this.frame35 },
      { id: 3, name: 'PICK 4', prize: '₦7.2M', timeRemaining: '01:37:03', label: 'Today', frameIcon: this.frame36 },
      { id: 4, name: 'JACKPOT', prize: '₦12.8M', timeRemaining: '01:37:03', label: 'Monday 9:30 AM', frameIcon: this.frame36 }
    ];
  }

  startGameSelection() {
    this.showGameSelection = true;
  }
}
