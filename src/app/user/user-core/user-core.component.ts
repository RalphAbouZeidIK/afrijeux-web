import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-user-core',
  templateUrl: './user-core.component.html',
  styleUrls: ['./user-core.component.scss'],
  standalone: false
})
export class UserCoreComponent {
  routeDetails: any;
  navList: any
  constructor(
    private languageSrv: LanguageService,
    private translate: TranslateService) {
    translate.onLangChange.subscribe(() => {
      this.composeRoutes()
    });
  }


  ngOnInit(): void {
    this.composeRoutes()
  }

  composeRoutes() {
    this.navList = this.languageSrv.composeRoutes()
  }
}
