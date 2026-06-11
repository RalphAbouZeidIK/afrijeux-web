import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GamesService } from 'src/app/services/games.service';
import { PlayTypeRule } from '../game-playtypes/game-playtypes.component';
import { LotoGameContent, LotoGameContentKey, LOTO_GAME_CONTENT } from './homepage-content';
import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit, OnDestroy {
  shouldRenderContent = true;

  private queryParamsSubscription: Subscription | null = null;
  private hasInitializedQueryParams = false;
  allLotoEvents: any = null;
  resolvedGameEvent: any = null;

  constructor(private route: ActivatedRoute, private gamesSrv: GamesService, private gnrcSrv: GenericService, private router: Router) { }

  introTitle = '';
  introDescription = '';

  overviewParagraphs: string[] = [];

  howtoSteps: string[] = [];

  playTypeRules: PlayTypeRule[] = [];

  prizeSummaryLines: string[] = [];

  drawInfoText = '';

  highlights: string[] = [];

  examples: string[] = [];

  isAndroidApp = this.gnrcSrv.isMachineApp()

  gameName = (this.isAndroidApp) ? this.router.url.split('/')[2]?.split('?')[0] : this.router.url.split('/')[1]?.split('?')[0]


  async ngOnInit(): Promise<void> {
    const navGameEvent = history.state?.gameEvent;
    if (navGameEvent) {
      this.resolvedGameEvent = navGameEvent;
    } else {
      this.allLotoEvents = await this.gamesSrv.getAllLotoGames();
      this.resolvedGameEvent = this.resolveSelectedEvent();
    }

    if (!this.isAndroidApp) {
      this.queryParamsSubscription = this.route.queryParamMap.subscribe(async () => {
        if (!this.allLotoEvents) {
          this.allLotoEvents = await this.gamesSrv.getAllLotoGames();
        }
        this.resolvedGameEvent = this.resolveSelectedEvent();
        await this.applySelectedContent();

        // Skip the first emission to avoid an unnecessary initial remount.
        if (!this.hasInitializedQueryParams) {
          this.hasInitializedQueryParams = true;
          return;
        }

        this.reloadHomepageContent();
      });
    }

  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  private reloadHomepageContent(): void {
    this.shouldRenderContent = false;
    setTimeout(() => {
      this.shouldRenderContent = true;
    });
  }

  private async applySelectedContent(): Promise<void> {
    const contentKey = await this.resolveContentKey();
    const content = LOTO_GAME_CONTENT[contentKey] || LOTO_GAME_CONTENT.pick2;
    this.setContent(content);
  }

  private async resolveContentKey(): Promise<LotoGameContentKey> {
    const currentUrl = window.location.href;
    if (currentUrl.includes('/Jackpot')) {
      return 'jackpot';
    }

    const gameEventId = Number(this.route.snapshot.queryParamMap.get('gameEventId'));
    if (!Number.isNaN(gameEventId) && gameEventId > 0) {
      const configVersionId = await this.getConfigurationVersionIdFromGameEventId(gameEventId);
      return this.getPickContentKeyFromConfigurationVersion(configVersionId);
    }

    // Backward compatibility for old URLs that still use gametype.
    const gameType = Number(this.route.snapshot.queryParamMap.get('gametype'));
    if (!Number.isNaN(gameType) && gameType > 0) {
      return this.getPickContentKeyFromConfigurationVersion(gameType);
    }

    // No URL params: infer the default pick type from available PickX events.
    const defaultVersionId = await this.getDefaultPickXConfigurationVersion();
    return this.getPickContentKeyFromConfigurationVersion(defaultVersionId);
  }

  private getPickContentKeyFromConfigurationVersion(gameType: number): LotoGameContentKey {
    console.log(gameType)
    if (gameType === 2) {
      return 'pick2';
    }

    if (gameType === 3) {
      return 'pick3';
    }

    if (gameType === 4) {
      return 'pick4';
    }

    if (gameType === 5) {
      return 'pick5';
    }

    return 'pick2';
  }

  private async getConfigurationVersionIdFromGameEventId(gameEventId: number): Promise<number> {
    try {
      if (!this.allLotoEvents) {
        this.allLotoEvents = await this.gamesSrv.getAllLotoGames();
      }

      const pickXEvents = Array.isArray(this.allLotoEvents?.pickXGames) ? this.allLotoEvents.pickXGames : [];
      const matchedEvent = pickXEvents.find(
        (eventItem: any) => Number(eventItem?.GameEventId) === Number(gameEventId) && eventItem.GameRouteGenerated?.toLowerCase() == this.gameName.toLowerCase()
      );
      console.log(matchedEvent)
      return Number(matchedEvent?.ConfigurationVersionId);
    } catch (error) {
      console.warn(error);
      return NaN;
    }
  }

  private async getDefaultPickXConfigurationVersion(): Promise<number> {
    try {
      if (!this.allLotoEvents) {
        this.allLotoEvents = await this.gamesSrv.getAllLotoGames();
      }

      const pickXEvents = Array.isArray(this.allLotoEvents?.pickXGames)
        ? this.allLotoEvents.pickXGames.filter((eventItem: any) => !eventItem?.IsSalesStopped)
        : [];

      if (pickXEvents.length === 0) {
        return NaN;
      }

      // Keep the same default event strategy as the game block (first available event).
      return Number(pickXEvents[0]?.ConfigurationVersionId);
    } catch (error) {
      console.warn(error);
      return NaN;
    }
  }

  private resolveSelectedEvent(): any {
    if (!this.allLotoEvents) return null;
    const currentUrl = window.location.href;
    const isJackpot = currentUrl.includes('/Jackpot');
    const isPickX = currentUrl.includes('PickX') || currentUrl.includes('WinBig');
    const events: any[] = isJackpot
      ? (this.allLotoEvents?.jackpotGames ?? [])
      : (this.allLotoEvents?.pickXGames ?? []);
    const active = events.filter((e: any) => !e.IsSalesStopped);
    if (active.length === 0) return null;

    let selected = active[0];
    const gameEventId = this.route.snapshot.queryParamMap.get('gameEventId');
    const legacyGameType = this.route.snapshot.queryParamMap.get('gametype');

    if (gameEventId) {
      const matched = isJackpot
        ? active.find((e: any) => Number(e.GameEventId) === Number(gameEventId))
        : active.find((e: any) => Number(e.GameEventId) === Number(gameEventId) && e.GameRouteGenerated?.toLowerCase() === this.gameName.toLowerCase());
      if (matched) selected = matched;
    } else if (legacyGameType && isPickX) {
      const matched = active.find((e: any) => Number(e.ConfigurationVersionId) === Number(legacyGameType));
      if (matched) selected = matched;
    }

    return selected;
  }

  private setContent(content: LotoGameContent): void {
    this.introTitle = content.introTitle;
    this.introDescription = content.introDescription;
    this.overviewParagraphs = content.overviewParagraphs;
    this.howtoSteps = content.howtoSteps;
    this.playTypeRules = content.playTypeRules;
    this.prizeSummaryLines = content.prizeSummaryLines;
    this.drawInfoText = content.drawInfoText;
    this.highlights = content.highlights;
    this.examples = content.examples;
  }

}

