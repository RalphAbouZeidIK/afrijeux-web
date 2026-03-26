import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GamesService } from 'src/app/services/games.service';
import { PlayTypeRule } from '../game-playtypes/game-playtypes.component';
import { LotoGameContent, LotoGameContentKey, LOTO_GAME_CONTENT } from './homepage-content';

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
  private allLotoEvents: any = null;

  constructor(private route: ActivatedRoute, private gamesSrv: GamesService) {}

  introTitle = '';
  introDescription = '';

  overviewParagraphs: string[] = [];

  howtoSteps: string[] = [];

  playTypeRules: PlayTypeRule[] = [];

  prizeSummaryLines: string[] = [];

  drawInfoText = '';

  highlights: string[] = [];

  examples: string[] = [];

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParamMap.subscribe(async () => {
      await this.applySelectedContent();

      // Skip the first emission to avoid an unnecessary initial remount.
      if (!this.hasInitializedQueryParams) {
        this.hasInitializedQueryParams = true;
        return;
      }

      this.reloadHomepageContent();
    });
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
        (eventItem: any) => Number(eventItem?.GameEventId) === Number(gameEventId)
      );

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

