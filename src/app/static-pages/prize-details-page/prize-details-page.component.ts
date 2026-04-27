import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Prize {
  rank: number;
  matches: number;
  amount: number;
}

interface PlayType {
  name: string;
  description: string;
  prizes: Prize[];
}

interface Game {
  id: string;
  title: string;
  badge: string;
  playPrice: number;
  playTypes: PlayType[];
}

@Component({
  selector: 'app-prize-details-page',
  standalone: false,
  templateUrl: './prize-details-page.component.html',
  styleUrl: './prize-details-page.component.scss'
})
export class PrizeDetailsPageComponent {
  expandedGame: string | null = 'pick3';

  games: Game[] = [
    {
      id: 'pick3',
      title: 'Pick 3',
      badge: 'Pick 3 Balls',
      playPrice: 5,
      playTypes: [
        {
          name: 'Straight',
          description: 'Your numbers should match the winning numbers in the exact order drawn.',
          prizes: [
            { rank: 1, matches: 2, amount: 3000 },
            { rank: 2, matches: 2, amount: 1250 },
            { rank: 3, matches: 1, amount: 10 }
          ]
        },
        {
          name: 'Rumble (Any Order)',
          description: 'Your numbers should match the winning numbers in any order.',
          prizes: [
            { rank: 1, matches: 2, amount: 500 },
            { rank: 2, matches: 2, amount: 1250 },
            { rank: 3, matches: 1, amount: 10 }
          ]
        },
        {
          name: 'Chance (Right-to-Left Match)',
          description: 'One or more digits of your selection match the draw result from right to left, in the correct order.',
          prizes: [
            { rank: 1, matches: 3, amount: 1500 },
            { rank: 2, matches: 2, amount: 1250 },
            { rank: 3, matches: 1, amount: 10 }
          ]
        },
        {
          name: 'Reverse Straight',
          description: 'Your numbers match the winning numbers in exact order or in reverse.',
          prizes: [
            { rank: 1, matches: 3, amount: 300 },
            { rank: 2, matches: 2, amount: 1250 },
            { rank: 3, matches: 1, amount: 10 }
          ]
        }
      ]
    },
    {
      id: 'pick4',
      title: 'Pick 4',
      badge: 'Pick 4 Balls',
      playPrice: 10,
      playTypes: [
        {
          name: 'Straight',
          description: 'Your numbers should match the winning numbers in the exact order drawn.',
          prizes: [
            { rank: 1, matches: 4, amount: 5000 }
          ]
        },
        {
          name: 'Rumble (Any Order)',
          description: 'Your numbers should match the winning numbers in any order.',
          prizes: [
            { rank: 1, matches: 4, amount: 1000 },
            { rank: 2, matches: 2, amount: 1250 },
            { rank: 3, matches: 1, amount: 10 }
          ]
        }
      ]
    },
    {
      id: 'jackpot',
      title: 'Jackpot',
      badge: 'Pick 6 Balls',
      playPrice: 20,
      playTypes: [
        {
          name: 'Straight',
          description: 'Your numbers should match the winning numbers in the exact order drawn.',
          prizes: [
            { rank: 1, matches: 6, amount: 1000000 },
            { rank: 2, matches: 2, amount: 1250 },
            { rank: 3, matches: 1, amount: 10 }
          ]
        }
      ]
    }
  ];

  toggleGame(game: string) {
    this.expandedGame = this.expandedGame === game ? null : game;
  }
}
