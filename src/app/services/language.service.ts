import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(
    @Inject(LOCALE_ID) private localeId: string,
    private router: Router,
    private translate: TranslateService,
    private gnrcSrv: GenericService
  ) {
    translate.onLangChange.subscribe(() => {
      this.composeRoutes(); // retranslate when language changes
    });
  }

  changeLanguage(language: string) {
    this.localeId = language;
    // Angular will update the language automatically using i18n system
  }

  setLocale(language: string) {
    this.localeId = language;
  }

  composeRoutes(): any[] {
    let pageRouteString = this.gnrcSrv.getFirstPathName()
    const pageRoute: any = this.router.config.find(r => r.path === pageRouteString);
    if (!pageRoute || !Array.isArray(pageRoute._loadedRoutes)) return [];

    const routeWithChildren = pageRoute._loadedRoutes.find((r: any) => Array.isArray(r.children));
    console.log(routeWithChildren)
    if (!routeWithChildren) return [];
    let navList = routeWithChildren.children.filter((route: any) => route?.data.showLink);
    console.log(navList)
    const keys = navList.map((route: any) => route?.data.title);

    this.translate.get(keys).subscribe(translations => {
      navList = navList.map((route: any) => ({
        ...route,
        title: translations[route.data.title] || route.data.title
      }));
    });
    console.log(navList)
    return navList;
  }


}
