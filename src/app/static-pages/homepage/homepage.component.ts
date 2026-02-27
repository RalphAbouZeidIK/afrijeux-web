import { Component } from '@angular/core';

@Component({
  selector: 'app-homepage',
  standalone:false,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {
  showGameSelection = false;
  
  games = [
    { id: 1, name: 'PICK 2', prize: '₦3.65M', timeRemaining: '01:37:03' },
    { id: 2, name: 'PICK 3', prize: '₦10.4M', timeRemaining: '01:37:03' },
    { id: 3, name: 'PICK 4', prize: '₦7.2M', timeRemaining: '01:37:03' },
    { id: 4, name: 'JACKPOT', prize: '₦12.8M', timeRemaining: '01:37:03' }
  ];

  previousDrawResults = [
    { id: 1, name: 'Pick 2', results: [2, 5], prize: '₦1.13M' },
    { id: 2, name: 'Pick 3', results: [1, 6, 8], prize: '₦1.23M' },
    { id: 3, name: 'Pick 4', results: [3, 5, 7, 9], prize: '₦7.8M' },
    { id: 4, name: 'Jackpot', results: [2, 4, 6, 8, 9], prize: '₦15.6M' }
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

  startGameSelection() {
    this.showGameSelection = true;
  }
}
