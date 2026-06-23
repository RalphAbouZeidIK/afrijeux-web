import { Component } from '@angular/core';

@Component({
  selector: 'app-games-list',
  standalone: false,
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.scss'
})
export class GamesListComponent {
  showGameSelection = false;

  gameBoxPattern = 'assets/images/games-list-pattern.png';


  games = [
    { id: 1, name: 'PICK 2', prize: '₦3.65M', timeRemaining: '01:37:03', label: 'Today' },
    { id: 2, name: 'PICK 3', prize: '₦10.4M', timeRemaining: '01:37:03', label: 'Saturday 7:15 PM' },
    { id: 3, name: 'PICK 4', prize: '₦7.2M', timeRemaining: '01:37:03', label: 'Today' },
    { id: 4, name: 'JACKPOT', prize: '₦12.8M', timeRemaining: '01:37:03', label: 'Monday 9:30 AM' }
  ];


  startGameSelection() {
    this.showGameSelection = true;
  }
}
