import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationError, Router, Event, NavigationStart } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';
import { MachineService } from 'src/app/services/machine.service';

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
    private machineSrv: MachineService,
    private translate: TranslateService
  ) {

    this.route.params.subscribe(params => {
      //console.log(params); // Log route params to check if they are correctly captured
    });

    this.isDesktopSubscription = this.gnrcSrv.getIsDesktopViewListener().subscribe((isDesktop) => {
      this.isDesktop = isDesktop;
    });

    this.filtersSubscription = this.gamesSrv.getSportsFilter().subscribe((data) => {
      if (!this.isDesktop) {
        console.log('getting data')
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
    //console.trace()
    let params = {
      Language: 'en',
      ...apiParams,
      PageSize: this.pageSize,
      PageNumber: this.page,
    };
    //console.log(params)
    this.matchesList = await this.gamesSrv.getMatches(params)
    // if (this.matchesList.length == 0 && apiParams.MatchName != null) {
    //   let message = ''
    //   this.translate.get('machine.errorMessages.noMatchesAvailable').subscribe((msg: string) => {
    //     message = msg
    //   });
    //   this.machineSrv.setModalData(true, false, message)
    //   setTimeout(async () => {
    //     params.MatchName = null
    //     console.log('refreshing page')
    //     this.matchesList = await this.gamesSrv.getMatches(params)
    //   }, 4000);
    // }
    console.log(this.matchesList)
  }

  async getMatchOutcome(event: any) {
    //console.log(event)
    let firstPath = (!this.isDesktop) ? `${this.router.url.split('/')[1]}/${this.router.url.split('/')[2]}` : this.router.url.split('/')[1]
    this.router.navigate([`${firstPath}/${event.SportId}/Categories/${event.CategoryId}/Tournaments/${event.TournamentId}/Outcomes/${event.MatchId}`])
  }

  ngOnDestroy(): void {
    this.isDesktopSubscription.unsubscribe;
    this.filtersSubscription.unsubscribe;
  }
}
