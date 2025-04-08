import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.scss'],
    standalone: false
})
export class HomepageComponent implements OnInit, OnDestroy {
  matchesList = []

  outcomesList = []

  sportId = 1
  tournamentId = null
  categoryId = null

  routeSub!: Subscription;

  constructor(private apiSrv: ApiService, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      console.log(params); // Log route params to check if they are correctly captured
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.sportId = params['sportId']; // Update matchId when params change
      this.tournamentId = params['tournamentId']; // Update matchId when params change
      this.categoryId = params['categoryId']; // Update matchId when params change
      this.getMatches()
    });
    console.log(this.sportId)
  }

  async getMatches() {
    let params = {
      Language: 'en',
      MatchName: null,
      TournamentId: this.tournamentId,
      CategoryId: this.categoryId,
      SportId: this.sportId,
      PageSize: 100,
      PageNumber: 1,
    }
    this.matchesList = await this.apiSrv.makeApi('AfrijeuxSportsBetting', 'AfrijeuxSportsBetting/GetMatchListByName', 'POST', params)
    console.log(this.matchesList)

    // let matchDetailsById = await this.apiSrv.betradarapi('v1/sports/en/sport_events/sr:match:51828433/fixture.xml', 'GET')
    // console.log(matchDetailsById)

    // let allgames = await this.apiSrv.betradarapi('v1/sports/en/schedules/2025-01-23/schedule.xml', 'GET')
    // console.log(allgames)
    // let filteredBySport = allgames.schedule.sport_event.filter((eventItem: any) => eventItem.tournament.sport.id == 'sr:sport:1')
    // let match = filteredBySport.find((matchItem:any)=>matchItem.id == `sr:match:51828433`)
    // console.log(this.matchesList)
    // console.log(filteredBySport)
    // console.log(match)

  }

  async getMatchOutcome(event: any) {
    console.log(event)
    this.router.navigate([`${location.pathname.split('/')[1]}/${event.SportId}/Categories/${event.CategoryId}/Tournaments/${event.TournamentId}/Outcomes/${event.MatchId}`])
  }

  ngOnDestroy(): void {
    // Don't forget to unsubscribe to avoid memory leaks
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
