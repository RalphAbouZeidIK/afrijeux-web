import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GenericService } from 'src/app/services/generic.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-sports-core',
  templateUrl: './sports-core.component.html',
  styleUrls: ['./sports-core.component.scss'],
  standalone: false
})
export class SportsCoreComponent {
  selectedFilters: any;
  navList: any
  isDesktop: any = this.gnrcSrv.getIsDesktopView()

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private languageSrv: LanguageService,
    private translate: TranslateService,
    private gnrcSrv:GenericService

  ) {
    translate.onLangChange.subscribe(() => {
      this.composeRoutes()
    });
  }

  ngOnInit(): void {
    this.composeRoutes()
    this.getSportsId()

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getSportsId()
      }
    });

  }

  getSportsId() {
    this.route.firstChild?.paramMap.subscribe(params => {
      let selectedFilters = {
        SportId: params.get('sportId'),
        TournamentId: params.get('tournamentId'),
        CategoryId: params.get('categoryId'),
      }
      this.selectedFilters = selectedFilters // Logs sportId for the child route
    });
  }
  
  composeRoutes() {
    this.navList = this.languageSrv.composeRoutes()
  }
}
