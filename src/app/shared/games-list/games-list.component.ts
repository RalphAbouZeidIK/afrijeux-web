import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';

interface GameCard {
  id: string;
  name: string;
  badgeText?: string;
  prize: number;
  GameEventDate: Date | null;
  imageUrl?: string;
  route: string;
  GameEventId: number | null;
  playPrice: number;
  gameType: 'pickX' | 'jackpot' | 'RAPID';
  Prize: number;
  Stake: number;
  IsSalesStopped?: boolean;
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
    //await this.gamesSrv.getAllEvents()
    const allEvents = await this.gamesSrv.getAllLotoGames();
    this.pickXEvents = Array.isArray(allEvents?.pickXGames)
      ? [...allEvents.pickXGames].sort((a, b) => Number(a?.ConfigurationVersionId) - Number(b?.ConfigurationVersionId))
      : [];
    console.log('PickX Events:', this.pickXEvents);
    this.jackpotEvents = Array.isArray(allEvents?.jackpotGames)
      ? [...allEvents.jackpotGames].sort((a, b) => Number(a?.ConfigurationVersionId) - Number(b?.ConfigurationVersionId))
      : [];
    console.log('Jackpot Events:', this.jackpotEvents);
    if (!this.isAndroidApp) {
      this.pickXEvents = this.pickXEvents.filter((e: any) => !e?.IsSalesStopped);
      this.jackpotEvents = this.jackpotEvents.filter((e: any) => !e?.IsSalesStopped);
    }
    this.buildGameCards();
  }

  private buildGameCards(): void {
    this.allGames = [];

    // Add PickX games
    this.pickXEvents.forEach((game: any) => {
      this.allGames.push({
        id: `pickx-${game.GameEventId}`,
        name: `${game.EventName}`,
        badgeText: `Pick ${game.ConfigurationVersionId} Balls`,
        prize: game.Prize || 0,
        GameEventDate: game.GameEventDate,
        imageUrl: `assets/images/pick${game.ConfigurationVersionId}.svg`,
        route: this.isAndroidApp ? '/Machine/PickX' : '/PickX',
        GameEventId: game.GameEventId,
        playPrice: 3,
        gameType: 'pickX',
        Prize: game.Prize || 0,
        Stake: game.Stake || 5,
        IsSalesStopped: game.IsSalesStopped
      });
    });

    // Add Jackpot games
    this.jackpotEvents.forEach((game: any) => {
      this.allGames.push({
        id: `jackpot-${game.GameEventId}`,
        name: `${game.EventName}`,
        badgeText: `Pick 6 Balls`,
        prize: game.Prize || 0,
        GameEventDate: game.GameEventDate,
        imageUrl: `assets/images/jackpot.svg`,
        route: this.isAndroidApp ? '/Machine/Jackpot' : '/Jackpot',
        GameEventId: game.GameEventId,
        playPrice: game.PlayPrice || 5,
        gameType: 'jackpot',
        Prize: game.Prize || 0,
        Stake: game.Stake || 5,
        IsSalesStopped: game.IsSalesStopped
      });
    });

    if (this.isAndroidApp) {
      this.allGames.push({
        id: `keno`,
        name: `KENO`,
        badgeText: `Instant`,
        prize: 0,
        GameEventDate: null,
        imageUrl: `assets/images/keno.svg`,
        route: '/Machine/WinBigKeno',
        GameEventId: null,
        playPrice: 3,
        gameType: 'RAPID',
        Prize: 0,
        Stake: 3,
        IsSalesStopped: false
      })

       this.allGames.push({
        id: `rapid`,
        name: `RAPID`,
        badgeText: `Instant`,
        prize: 0,
        GameEventDate: null,
        imageUrl: `assets/images/rapid.svg`,
        route: '/Machine/WinBigRapid',
        GameEventId: null,
        playPrice: 3,
        gameType: 'RAPID',
        Prize: 0,
        Stake: 3,
        IsSalesStopped: false
      })
    }

  }


  async ngOnInit(): Promise<void> {
    this.gnrcSrv.toggleLoader(true);
    await this.getGameEvents();
    this.gnrcSrv.toggleLoader(false);
  }

  isGameSelected(game: GameCard): boolean {
    // Check if this game is selected by comparing gameEventId
    return this.selectedGameEventId != null && Number(this.selectedGameEventId) === Number(game.GameEventId);
  }

}
