import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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

  constructor(private route: ActivatedRoute) {}

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
    this.queryParamsSubscription = this.route.queryParamMap.subscribe(() => {
      this.applySelectedContent();

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

  private applySelectedContent(): void {
    const contentKey = this.resolveContentKey();
    const content = LOTO_GAME_CONTENT[contentKey] || LOTO_GAME_CONTENT.pick2;
    this.setContent(content);
  }

  private resolveContentKey(): LotoGameContentKey {
    const currentUrl = window.location.href;
    if (currentUrl.includes('/Jackpot')) {
      return 'jackpot';
    }

    const gameType = Number(this.route.snapshot.queryParamMap.get('gametype'));
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

