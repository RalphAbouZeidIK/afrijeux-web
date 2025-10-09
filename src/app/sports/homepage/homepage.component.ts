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
  matchesList: any = []


  sportId = 1
  tournamentId = null
  categoryId = null

  routeSub!: Subscription;

  isAndroidApp = this.gnrcSrv.isMachineApp()

  filtersSubscription: Subscription

  page = 1;

  pageSize = 10;

  SportId: any = null

  TournamentId: any = null

  CategoryId: any = null

  isDesktop: any = this.gnrcSrv.getIsDesktopView()

  isDesktopSubscription: Subscription


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gamesSrv: GamesService,
    private gnrcSrv: GenericService,
  ) {

    this.route.params.subscribe(params => {
      //console.log(params); // Log route params to check if they are correctly captured
    });

    this.isDesktopSubscription = this.gnrcSrv.getIsDesktopViewListener().subscribe((isDesktop) => {
      this.isDesktop = isDesktop;
    });

    this.filtersSubscription = this.gamesSrv.getSportsFilter().subscribe((data) => {
      if (!this.isDesktop) {
        this.getMatches(data)
      }
    })
  }

  ngOnInit(): void {
    if (this.isDesktop) {
      this.routeSub = this.route.params.subscribe(params => {
        this.SportId = params['sportId']; // Update matchId when params change
        this.TournamentId = params['tournamentId']; // Update matchId when params change
        this.CategoryId = params['categoryId']; // Update matchId when params change
        let apiParams = {
          SportId: this.SportId,
          TournamentId: this.TournamentId,
          CategoryId: this.CategoryId,
          MatchName: null
        }
        this.getMatches(apiParams)
      });
    }


  }

  async getMatches(apiParams: any) {
    let params = {
      Language: 'en',
      ...apiParams,
      PageSize: this.pageSize,
      PageNumber: this.page,
    };
    console.log(params)
    this.matchesList = await this.gamesSrv.getMatches(params)

  }

  async getMatchOutcome(event: any) {
    //console.log(event)
    let firstPath = (!this.isDesktop) ? `${this.router.url.split('/')[1]}/${this.router.url.split('/')[2]}` : this.router.url.split('/')[1]
    this.router.navigate([`${firstPath}/${event.SportId}/Categories/${event.CategoryId}/Tournaments/${event.TournamentId}/Outcomes/${event.MatchId}`])
  }

  ngOnDestroy(): void {
    this.isDesktopSubscription.unsubscribe;
    this.filtersSubscription.unsubscribe;
    this.routeSub.unsubscribe();
  }
}
