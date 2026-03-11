import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-games-links',
  standalone: false,
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.scss'
})
export class GamesLinksComponent implements OnChanges {

  pickXEvents: any;

  jackpotEvents: any;

  @Input() allEvents: any;
  @Input() isGamePage = false;
  @Input() selectedTypeId: number | string | null = null;

  constructor(private gamesSrv: GamesService, private router: Router) { }

  getGameEvents() {
    console.log(this.allEvents)
    this.pickXEvents = Array.isArray(this.allEvents?.pickXGames)
      ? [...this.allEvents.pickXGames].sort((a, b) => Number(a?.ConfigurationVersionId) - Number(b?.ConfigurationVersionId))
      : [];
    console.log('PickX Events:', this.pickXEvents);
    this.jackpotEvents = Array.isArray(this.allEvents?.jackpotGames)
      ? [...this.allEvents.jackpotGames].sort((a, b) => Number(a?.ConfigurationVersionId) - Number(b?.ConfigurationVersionId))
      : [];
    console.log('Jackpot Events:', this.jackpotEvents);
  }

  // ngOnInit() {
  //   this.getGameEvents();
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allEvents']) {
      this.getGameEvents();
    }
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
