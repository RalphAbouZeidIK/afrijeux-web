import { Injectable, Injector } from '@angular/core';
import { Router, Route, RouteConfigLoadEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './user.service';

export interface MenuItem {
  path: string;
  title: string;
  game: string;
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

  private getCurrentGameFromUrl(): string | null {
    let url = this.router.url || '';
    if ((!url || url === '/') && typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      if (hash.startsWith('#')) url = hash.slice(1);
    }
    const segments = url.split(/[?#]/)[0].split('/').filter(Boolean);
    return segments.length ? segments[0] : null;
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
        title: data['title'],
        game: data['game']
      };

      // Handle lazy-loaded children
      if (r.loadChildren) {
        const subRoutes: Route[] = await this.loadSubRoutes(r); // now a Route[]
        const parent = subRoutes.find(sr => Array.isArray(sr.children));
        const children = parent?.children ?? [];

        const currentGame = this.getCurrentGameFromUrl(); // 👈 extract from URL (HPBPMU, PMUHybrid, etc.)

        item.children = children
          .filter(c => {
            const cData = c.data || {};
            if (!cData['showLink']) return false;
            if (cData['shouldBeLoggedIn'] && !isLoggedIn) return false;

            // ✅ Only include if game matches or is empty
            if (cData['game'] && cData['game'] !== currentGame) {
              return false;
            }

            return true;
          })
          .map(c => ({
            path: `${r.path}/${c.path}`,
            title: c.data!['title'],
            game: c.data!['game'] ?? ''
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
      game: i.game,
      children: i.children?.map(c => ({
        path: c.path,
        title: trans[c.title] || c.title,
        game: c.game
      }))
    }));
  }

}
