import { Injectable, Injector } from '@angular/core';
import { Router, Route, RouteConfigLoadEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

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
    private translate: TranslateService
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

    for (const r of this.router.config) {
      if (!r.data?.['showLink']) continue;

      const item: MenuItem = {
        path: r.path!,
        title: r.data['title']
      };

      if (r.loadChildren) {
        const subRoutes: Route[] = await this.loadSubRoutes(r); // now a Route[]

        const parent = subRoutes.find(sr => Array.isArray(sr.children));
        const children = parent?.children ?? [];

        item.children = children
          .filter(c => c.data?.['showLink'])
          .map(c => ({
            path: `${r.path}/${c.path}`,
            title: c.data?.['title']
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
