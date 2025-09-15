import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-sports-core',
  templateUrl: './sports-core.component.html',
  styleUrls: ['./sports-core.component.scss'],
  standalone:false
})
export class SportsCoreComponent {
  selectedFilters: any;
  navList: any
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private languageSrv: LanguageService, 
    private translate: TranslateService
  
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
        sportId: params.get('sportId'),
        tournamentId: params.get('tournamentId'),
        categoryId: params.get('categoryId'),
      }
      this.selectedFilters = selectedFilters // Logs sportId for the child route
    });
  }
  
  composeRoutes() {
    this.navList = this.languageSrv.composeRoutes()
  }
}
