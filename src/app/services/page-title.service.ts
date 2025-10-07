import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  constructor(
    private title: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) { }

  init() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      mergeMap(route => route.data)
    ).subscribe(data => {
      const titleKey = data['title'];
      //console.log(titleKey)
      if (titleKey) {
        this.translate.get(titleKey).subscribe(translatedTitle => {
          setTimeout(() => {
            this.title.setTitle(translatedTitle);
          }, 50);
        });
      }
    });

    // Handle language switch
    this.translate.onLangChange.subscribe(() => {
      const route = this.getDeepestChild(this.activatedRoute);
      const titleKey = route?.snapshot?.data?.['title'];
      //console.log(titleKey)
      if (titleKey) {
        this.translate.get(titleKey).subscribe(translatedTitle => {
          this.title.setTitle(translatedTitle);
        });
      }
    });
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
