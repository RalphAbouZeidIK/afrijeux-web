import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';
import { MachineService } from 'src/app/services/machine.service';

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
  GameRouteGenerated?: string,
  GameId?: number;
  queryParams?: Record<string, any>;
  isPromoCard?: boolean;
  PromotionConfiguration?: any[];
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
  listItems: GameCard[] = [];
  normalGames: GameCard[] = [];
  rapidGames: GameCard[] = [];
  normalGamesShown = true;

  @Input() isListingPage = false;
  @Input() isGamePage = false;
  @Input() isBanner = false;
  @Input() isHeader = false
  @Input() selectedGameEventId: number | string | null = null;
  gameName = (this.isAndroidApp) ? this.router.url.split('/')[2]?.split('?')[0] : this.router.url.split('/')[1]?.split('?')[0]
  allowedGameIds = new Set<number>();

  constructor(private gnrcSrv: GenericService, private router: Router, private gamesSrv: GamesService, private machineSrv: MachineService, private activatedRoute: ActivatedRoute) { }

  async getGameEvents() {
    //await this.gamesSrv.getAllEvents()
    const allEvents = await this.gamesSrv.getAllLotoGames();
    console.log('All Events Response:', allEvents);
    this.pickXEvents = Array.isArray(allEvents?.pickXGames)
      ? [...allEvents.pickXGames].sort((a, b) => Number(a?.ConfigurationVersionId) - Number(b?.ConfigurationVersionId))
      : [];
    //console.log('PickX Events:', this.pickXEvents);
    this.jackpotEvents = Array.isArray(allEvents?.jackpotGames)
      ? [...allEvents.jackpotGames].sort((a, b) => Number(a?.ConfigurationVersionId) - Number(b?.ConfigurationVersionId))
      : [];
    //console.log('Jackpot Events:', this.jackpotEvents);
    if (!this.isAndroidApp) {
      this.pickXEvents = this.pickXEvents.filter((e: any) => !e?.IsSalesStopped);
      this.jackpotEvents = this.jackpotEvents.filter((e: any) => !e?.IsSalesStopped);
    }
    this.buildGameCards();
  }

  private buildGameCards(): void {
    this.listItems = [];
    this.normalGames = [];
    this.rapidGames = [];
    const promoCards: GameCard[] = [];
    console.log(this.listItems)
    // Add PickX games
    if (this.normalGamesShown) {
      this.pickXEvents.forEach((game: any) => {

        this.normalGames.push({
          id: `pickx-${game.GameEventId}`,
          name: `${game.EventName}`,
          badgeText: `Pick ${game.pickTypePerGame} Numbers`,
          prize: game.Prize || 0,
          GameEventDate: game.GameEventDate,
          imageUrl: `assets/images/pick${game.pickTypePerGame}.svg`,
          route: this.isAndroidApp ? `/Machine/WinBig${game.pickTypePerGame}` : `/WinBig${game.pickTypePerGame}`,
          GameEventId: game.GameEventId,
          playPrice: 3,
          gameType: 'pickX',
          Prize: game.Prize || 0,
          Stake: game.Stake || 5,
          IsSalesStopped: game.IsSalesStopped,
          GameRouteGenerated: game.GameRouteGenerated,
          GameId: game.GameId
        });

        if (Array.isArray(game.PromotionConfiguration) && game.PromotionConfiguration.length > 0) {
          promoCards.push({
            id: `promo-pickx-${game.GameEventId}`,
            name: `${game.EventName}`,
            badgeText: `Promotion`,
            prize: game.Prize || 0,
            GameEventDate: game.GameEventDate,
            imageUrl: `assets/images/pick${game.pickTypePerGame}.svg`,
            route: this.isAndroidApp ? `/Machine/WinBig${game.pickTypePerGame}` : `/WinBig${game.pickTypePerGame}`,
            GameEventId: game.GameEventId,
            playPrice: 3,
            gameType: 'pickX',
            Prize: game.Prize || 0,
            Stake: game.Stake || 5,
            IsSalesStopped: game.IsSalesStopped,
            GameRouteGenerated: game.GameRouteGenerated,
            GameId: game.GameId,
            isPromoCard: true,
            PromotionConfiguration: game.PromotionConfiguration,
            queryParams: { gameEventId: game.GameEventId, showPromotions: true }
          });
        }
      });

      // Add Jackpot games
      this.jackpotEvents.forEach((game: any) => {
        this.normalGames.push({
          id: `jackpot-${game.GameEventId}`,
          name: `${game.EventName}`,
          badgeText: `Pick 6 Numbers`,
          prize: game.Prize || 0,
          GameEventDate: game.GameEventDate,
          imageUrl: `assets/images/jackpot.svg`,
          route: this.isAndroidApp ? '/Machine/Jackpot' : '/Jackpot',
          GameEventId: game.GameEventId,
          playPrice: game.PlayPrice || 5,
          gameType: 'jackpot',
          Prize: game.Prize || 0,
          Stake: game.Stake || 5,
          IsSalesStopped: game.IsSalesStopped,
          GameRouteGenerated: 'Jackpot',
          GameId: game.GameId
        });

        if (Array.isArray(game.PromotionConfiguration) && game.PromotionConfiguration.length > 0) {
          promoCards.push({
            id: `promo-${game.GameEventId}`,
            name: `${game.EventName}`,
            badgeText: `Promotion`,
            prize: game.Prize || 0,
            GameEventDate: game.GameEventDate,
            imageUrl: `assets/images/jackpot.svg`,
            route: this.isAndroidApp ? '/Machine/Jackpot' : '/Jackpot',
            GameEventId: game.GameEventId,
            playPrice: game.PlayPrice || 5,
            gameType: 'jackpot',
            Prize: game.Prize || 0,
            Stake: game.Stake || 5,
            IsSalesStopped: game.IsSalesStopped,
            GameRouteGenerated: 'Jackpot',
            GameId: game.gameId,
            isPromoCard: true,
            PromotionConfiguration: game.PromotionConfiguration,
            queryParams: { gameEventId: game.GameEventId, showPromotions: true }
          });
        }
      });
      this.normalGames = [...promoCards, ...this.normalGames];
    }


    if (this.isAndroidApp) {
      const rapidDefs = [
        { id: 'keno', name: 'KENO', image: 'keno.svg', route: '/Machine/WinBigKeno', gameId: 63 },
        { id: 'rapid-animals', name: 'RAPID Animals', image: 'rapid.svg', route: '/Machine/WinBigRapid', gameId: 60 },
        { id: 'rapid-emojis', name: 'RAPID Emojis', image: 'rapid-emojis.svg', route: '/Machine/WinBigRapidEmojis', gameId: 74 },
        { id: 'rapid-football', name: 'RAPID Football', image: 'rapid-football.svg', route: '/Machine/WinBigRapidFootball', gameId: 75 },
        { id: 'rapid-fruits', name: 'RAPID Fruits', image: 'rapid-fruits.svg', route: '/Machine/WinBigRapidFruits', gameId: 76 },
        { id: 'rapid-luxury', name: 'RAPID Luxury', image: 'rapid-luxury.svg', route: '/Machine/WinBigRapidLuxury', gameId: 77 },
        { id: 'rapid-numbers', name: 'RAPID Numbers', image: 'mega-win.svg', route: '/Machine/WinBigRapidNumbers', gameId: 79 },
        { id: 'rapid-numbers-lite', name: 'RAPID Numbers Lite', image: 'quick-match.svg', route: '/Machine/WinBigRapidNumbersLite', gameId: 80 },
      ];

      for (const def of rapidDefs) {
        if (def.gameId !== null && !this.allowedGameIds.has(def.gameId)) continue;
        this.rapidGames.push({
          id: def.id,
          name: def.name,
          badgeText: 'Instant',
          prize: 0,
          GameEventDate: null,
          imageUrl: `assets/images/${def.image}`,
          route: def.route,
          GameEventId: null,
          playPrice: 3,
          gameType: 'RAPID',
          Prize: 0,
          Stake: 3,
          IsSalesStopped: false,
          GameId: def.gameId ?? undefined
        });
      }
    }
    if (this.isHeader) {
      this.listItems = this.uniqueGames()
      console.log(this.listItems)
    }
    this.listItems = this.normalGamesShown ? [...this.normalGames] : [...this.rapidGames];
    console.log('List Items:', this.listItems);
  }

  switchGameTypes() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.normalGamesShown = !this.normalGamesShown;
    if (this.normalGamesShown) {
      if (this.normalGames.length === 0) {
        this.getGameEvents();
        return;
      }
      this.listItems = [...this.normalGames];
    }
    else {
      this.listItems = [...this.rapidGames];
    }
  }

  uniqueGames() {
    const seen = new Set();

    return this.listItems.filter((game: any) => {
      if (seen.has(game.gameId)) {
        return false;
      }

      seen.add(game.gameId);
      return true;
    });
  }

  async ngOnInit(): Promise<void> {
    //this.gnrcSrv.toggleLoader(true);
    try {
      const param = this.activatedRoute.snapshot.queryParamMap.get('normalGamesShown');
      this.normalGamesShown = param === null || param === 'true';
      if (this.isAndroidApp) {
        const userData = await this.machineSrv.getUserData();
        const games: any[] = userData?.Games ?? [];
        this.allowedGameIds = new Set(games.map((g: any) => g.gameId));
      }
      (this.normalGamesShown) ? await this.getGameEvents() : this.buildGameCards();;
    } catch (error) {
      console.error('Error fetching game events:', error);
    }
    finally {
      //this.gnrcSrv.toggleLoader(false);
    }
  }

  navigateToGame(card: GameCard) {
    if (card.gameType === 'RAPID' || card.GameEventId === null) {
      this.router.navigate([card.route]);
      return;
    }
    console.log(card)
    const events = card.gameType === 'jackpot' ? this.jackpotEvents : this.pickXEvents;
    const fullEvent = events?.find((e: any) => e.GameId === card.GameId && (Number(e.GameEventId) === Number(card.GameEventId)));
    const queryParams = card.queryParams ?? { gameEventId: card.GameEventId};
    console.log(`Navigating to game: ${card.name}, Route: ${card.route}, QueryParams:`, queryParams, 'Full Event:', fullEvent);
    this.router.navigate([card.route], {
      queryParams,
      state: fullEvent ? { gameEvent: fullEvent } : undefined
    });
  }

  isGameSelected(game: GameCard): boolean {
    // Check if this game is selected by comparing gameEventId
    if (this.isHeader) {
      let gameName = this.router.url.split('/')[1]?.split('?')[0]
      return game.GameRouteGenerated?.toLowerCase() == gameName.toLowerCase()
    }
    else {
      return this.selectedGameEventId != null && Number(this.selectedGameEventId) === Number(game.GameEventId) && game.GameRouteGenerated?.toLowerCase() == this.gameName.toLowerCase();

    }
  }

}
