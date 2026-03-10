import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-games-links',
  standalone: false,
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.scss'
})
export class GamesLinksComponent implements OnInit {

  pickXEvents: any;

  jackpotEvents: any;

  @Input() cssClass = '';
  @Input() selectedTypeId: number | string | null = null;

  constructor(private gamesSrv: GamesService, private router: Router) { }

  async getGameEvents() {
    const pickXEvents = await this.gamesSrv.getGamesEvents('PickX');
    this.pickXEvents = Array.isArray(pickXEvents)
      ? [...pickXEvents].sort((a, b) => Number(a?.ConfigurationVersionId) - Number(b?.ConfigurationVersionId))
      : [];
    console.log('PickX Events:', this.pickXEvents);
    this.jackpotEvents = await this.gamesSrv.getGamesEvents('Jackpot');
    console.log('Jackpot Events:', this.jackpotEvents);
  }

  ngOnInit() {
    this.getGameEvents();
  }

  isSelectedPickX(pickX: any): boolean {
    if (this.selectedTypeId == null) {
      return false;
    }
    return Number(this.selectedTypeId) === Number(pickX?.ConfigurationVersionId);
  }

  isJackpotRoute(): boolean {
    return this.router.url.includes('/Jackpot');
  }
}
