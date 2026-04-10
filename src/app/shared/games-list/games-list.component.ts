import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-games-links',
  standalone: false,
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.scss'
})
export class GamesLinksComponent implements OnChanges {
  isAndroidApp = this.gnrcSrv.isMachineApp()

  pickXEvents: any;

  jackpotEvents: any;

  @Input() allEvents: any;
  @Input() isGamePage = false;
  @Input() selectedGameEventId: number | string | null = null;

  constructor(private gnrcSrv: GenericService, private router: Router) { }

  getGameEvents() {
    console.log(this.allEvents)
    this.pickXEvents = Array.isArray(this.allEvents?.pickXGames)
      ? [...this.allEvents.pickXGames].filter((e: any) => !e?.IsSalesStopped).sort((a, b) => Number(a?.ConfigurationVersionId) - Number(b?.ConfigurationVersionId))
      : [];
    console.log('PickX Events:', this.pickXEvents);
    this.jackpotEvents = Array.isArray(this.allEvents?.jackpotGames)
      ? [...this.allEvents.jackpotGames].filter((e: any) => !e?.IsSalesStopped).sort((a, b) => Number(a?.ConfigurationVersionId) - Number(b?.ConfigurationVersionId))
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
    if (this.selectedGameEventId == null) {
      return false;
    }
    return Number(this.selectedGameEventId) === Number(pickX?.GameEventId);
  }

  isJackpotRoute(): boolean {
    return this.router.url.includes('/Jackpot');
  }
}
