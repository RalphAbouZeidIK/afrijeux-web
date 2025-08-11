import { Injectable, Injector } from '@angular/core';
import { Router, Route, RouteConfigLoadEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './user.service';

export interface MenuItem {
  path: string;
  title: string;
  children?: MenuItem[];
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private lazyLoader: any;

  constructor(
    private router: Router,
    private injector: Injector,
    private translate: TranslateService,
    private userService: UserService
  ) {
    // Access Angular's private loader
    // @ts-ignore
    this.lazyLoader = (router as any).navigationTransitions?.configLoader;
  }

  /**
   * Dynamically load sub-routes of a lazy-loaded route
   */
  private async loadSubRoutes(route: Route): Promise<Route[]> {
    if (!this.lazyLoader || !route.loadChildren) return [];

    const moduleConfig: any = await this.lazyLoader
      .loadChildren(this.injector, route)
      .toPromise();  // or lastValueFrom(...)

    return moduleConfig.routes ?? [];  // Return actual Route[] array
  }
  /**
   * Build the full menu from router config + loaded lazy routes
   */
  async getMenu(): Promise<MenuItem[]> {
    const menuItems: MenuItem[] = [];
    const isLoggedIn = this.userService.isUserLoggedIn(); // assume synchronous check

    for (const r of this.router.config) {
      const data = r.data || {};

      // Check showLink and shouldBeLoggedIn
      if (!data['showLink']) continue;
      if (data['shouldBeLoggedIn'] && !isLoggedIn) continue;

      const item: MenuItem = {
        path: r.path!,
        title: data['title']
      };

      // Handle lazy-loaded children
      if (r.loadChildren) {
        const subRoutes: Route[] = await this.loadSubRoutes(r); // now a Route[]
        const parent = subRoutes.find(sr => Array.isArray(sr.children));
        const children = parent?.children ?? [];

        item.children = children
          .filter(c => {
            const cData = c.data || {};
            if (!cData['showLink']) return false;
            if (cData['shouldBeLoggedIn'] && !isLoggedIn) return false;
            return true;
          })
          .map(c => ({
            path: `${r.path}/${c.path}`,
            title: c.data!['title']
          }));
      }

      menuItems.push(item);
    }

    // Translate titles in bulk
    const keys = menuItems.flatMap(i => [
      i.title,
      ...(i.children?.map(c => c.title) || [])
    ]);
    const trans = await this.translate.get(keys).toPromise();

    // Map translations
    return menuItems.map(i => ({
      path: i.path,
      title: trans[i.title] || i.title,
      children: i.children?.map(c => ({
        path: c.path,
        title: trans[c.title] || c.title
      }))
    }));
  }

}
