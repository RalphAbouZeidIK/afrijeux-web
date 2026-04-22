import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';

interface GameCard {
  id: string;
  name: string;
  badgeText?: string;
  prize: number;
  drawDate: Date;
  imageUrl?: string;
  route: string;
  GameEventId: number;
  playPrice: number;
  gameType: 'pickX' | 'jackpot';
  Prize: number;
  Stake: number;
}

@Component({
  selector: 'app-games-links',
  standalone: false,
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.scss'
})
export class GamesLinksComponent implements OnInit {
  isAndroidApp = this.gnrcSrv.isMachineApp()

  pickXEvents: any;
  jackpotEvents: any;
  allGames: GameCard[] = [];

  @Input() isListingPage = false;
  @Input() isGamePage = false;
  @Input() isBanner = false;
  @Input() selectedGameEventId: number | string | null = null;

  constructor(private gnrcSrv: GenericService, private router: Router, private gamesSrv: GamesService) { }

  async getGameEvents() {
    const allEvents = await this.gamesSrv.getAllLotoGames();
    this.pickXEvents = Array.isArray(allEvents?.pickXGames)
      ? [...allEvents.pickXGames].filter((e: any) => !e?.IsSalesStopped).sort((a, b) => Number(a?.ConfigurationVersionId) - Number(b?.ConfigurationVersionId))
      : [];
    console.log('PickX Events:', this.pickXEvents);
    this.jackpotEvents = Array.isArray(allEvents?.jackpotGames)
      ? [...allEvents.jackpotGames].filter((e: any) => !e?.IsSalesStopped).sort((a, b) => Number(a?.ConfigurationVersionId) - Number(b?.ConfigurationVersionId))
      : [];
    console.log('Jackpot Events:', this.jackpotEvents);
    this.buildGameCards();
  }

  private buildGameCards(): void {
    this.allGames = [];

    // Add PickX games
    this.pickXEvents.forEach((game: any) => {
      this.allGames.push({
        id: `pickx-${game.id}`,
        name: `${game.EventName}`,
        badgeText: `Pick ${game.ConfigurationVersionId} Balls`,
        prize: game.Prize || 0,
        drawDate: game.GameEventDate ? new Date(game.GameEventDate) : new Date(),
        imageUrl: game.ImageUrl || 'assets/images/game-icon.svg',
        route: this.isAndroidApp ? '/Machine/PickX' : '/PickX',
        GameEventId: game.GameEventId,
        playPrice: game.PlayPrice || 5,
        gameType: 'pickX',
        Prize: game.Prize || 0,
        Stake: game.Stake || 0
      });
    });

    // Add Jackpot games
    this.jackpotEvents.forEach((game: any) => {
      this.allGames.push({
        id: `jackpot-${game.id}`,
        name: `${game.EventName}`,
        badgeText: `Pick 6 Balls`,
        prize: game.Prize || 0,
        drawDate: game.GameEventDate ? new Date(game.GameEventDate) : new Date(),
        imageUrl: game.ImageUrl || 'assets/images/game-icon.svg',
        route: this.isAndroidApp ? '/Machine/Jackpot' : '/Jackpot',
        GameEventId: game.GameEventId,
        playPrice: game.PlayPrice || 5,
        gameType: 'jackpot',
        Prize: game.Prize || 0,
        Stake: game.Stake || 0
      });
    });
  }

  ngOnInit(): void {
    this.getGameEvents();
  }

  isGameSelected(game: GameCard): boolean {
    if (game.gameType === 'pickX') {
      return this.selectedGameEventId != null && Number(this.selectedGameEventId) === Number(game.GameEventId);
    } else {
      return this.router.url.includes('/Jackpot');
    }
  }

}
