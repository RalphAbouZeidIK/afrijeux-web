import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationError, Router, Event, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  standalone: false
})
export class HomepageComponent implements OnInit, OnDestroy {
  matchesList = []


  sportId = 1
  tournamentId = null
  categoryId = null

  routeSub!: Subscription;

  isMobile = false

  isAndroidApp = this.gnrcSrv.isMachineApp()

  filtersSubscription: Subscription

  constructor(
    private apiSrv: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private gamesSrv: GamesService,
    private gnrcSrv: GenericService,
  ) {
    this.route.params.subscribe(params => {
      //console.log(params); // Log route params to check if they are correctly captured
    });

    this.filtersSubscription = this.gamesSrv.getSportsFilter().subscribe((data) => {
      if (this.isMobile) {
        //console.log(data)
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
      Language: 'en',
      MatchName: null,
      ...apiParams,
      PageSize: 100,
      PageNumber: 1,
    };

    this.matchesList = await this.gamesSrv.getMatches(params)

    //console.log(this.matchesList)

  }

  async getMatchOutcome(event: any) {
    //console.log(event)
    let firstPath = (this.isMobile) ? `${this.router.url.split('/')[1]}/${this.router.url.split('/')[2]}` : this.router.url.split('/')[1]
    this.router.navigate([`${firstPath}/${event.SportId}/Categories/${event.CategoryId}/Tournaments/${event.TournamentId}/Outcomes/${event.MatchId}`])
  }

  ngOnDestroy(): void {
    // Don't forget to unsubscribe to avoid memory leaks
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
