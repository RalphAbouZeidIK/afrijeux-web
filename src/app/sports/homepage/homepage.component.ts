import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationError, Router, Event, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { GamesService } from 'src/app/services/games.service';

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

  isMobile = false

  filtersSubscription: Subscription

  constructor(
    private apiSrv: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private gamesSrv: GamesService
  ) {
    this.route.params.subscribe(params => {
      console.log(params); // Log route params to check if they are correctly captured
    });

    this.filtersSubscription = this.gamesSrv.getSportsFilter().subscribe((data) => {
      if (this.isMobile) {
        console.log(data)
        this.getMatches(data)
      }
    })
  }

  ngOnInit(): void {
    if (window.innerWidth < 1200) {
      this.isMobile = true
    }
    this.routeSub = this.route.params.subscribe(params => {
      let SportId = params['sportId']; // Update matchId when params change
      let TournamentId = params['tournamentId']; // Update matchId when params change
      let CategoryId = params['categoryId']; // Update matchId when params change
      let apiParams = {
        SportId: SportId,
        TournamentId: TournamentId,
        CategoryId: CategoryId
      }
      this.getMatches(apiParams)
    });
  }

  async getMatches(apiParams: any) {
    let params = {
      body: {
        Language: 'en',
        MatchName: null,
        ...apiParams,
        PageSize: 100,
        PageNumber: 1,
      }
    }
    this.matchesList = await this.apiSrv.makeApi('OnlineMaster', 'AfrijeuxSportsBetting/GetMatchListByName', 'POST', params)
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
    let firstPath = (this.isMobile) ? `${this.router.url.split('/')[1]}/${this.router.url.split('/')[2]}` : this.router.url.split('/')[1]
    this.router.navigate([`${firstPath}/${event.sportId}/Categories/${event.categoryId}/Tournaments/${event.tournamentId}/Outcomes/${event.matchId}`])
  }

  ngOnDestroy(): void {
    // Don't forget to unsubscribe to avoid memory leaks
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
