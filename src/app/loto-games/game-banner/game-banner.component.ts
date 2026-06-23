import { Component, Input, OnInit } from '@angular/core';

// assets pulled from Figma design context
const IMG_UAE_SYMBOL =
  'https://www.figma.com/api/mcp/asset/b3afa307-5019-4e8b-ad8d-e73fd7424b33';
const IMG_BANNER_BG_1 =
  'https://www.figma.com/api/mcp/asset/dead8267-f7b8-430c-9bd2-815bd07d9b8c';
const IMG_BANNER_BG_2 =
  'https://www.figma.com/api/mcp/asset/322b5d50-98e5-4593-bf67-e4072288e7b2';

@Component({
  selector: 'app-game-banner',
  standalone:false,
  templateUrl: './game-banner.component.html',
  styleUrls: ['./game-banner.component.scss'],
})
export class GameBannerComponent implements OnInit {
  // text content (all dynamic)
  @Input() prizePoolLabel = 'Pick 2 Prize Pool';
  @Input() prizePoolAmount = '0.00M';
  @Input() countdownTitle = 'Time till next draw';
  @Input() drawTime: Date = new Date();

  // image urls
  uaeSymbol = IMG_UAE_SYMBOL;
  bannerBg1 = IMG_BANNER_BG_1;
  bannerBg2 = IMG_BANNER_BG_2;

  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;

  private timer: any;

  ngOnInit(): void {
    this.updateCountdown();
    this.timer = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const target = this.drawTime.getTime();
    let diff = Math.max(0, target - now);

    this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= this.days * 1000 * 60 * 60 * 24;
    this.hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= this.hours * 1000 * 60 * 60;
    this.minutes = Math.floor(diff / (1000 * 60));
    diff -= this.minutes * 1000 * 60;
    this.seconds = Math.floor(diff / 1000);
  }
}
