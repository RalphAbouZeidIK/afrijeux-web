import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'mobile-app-nav',
  standalone: false,
  templateUrl: './app-nav.component.html',
  styleUrl: './app-nav.component.scss'
})
export class AppNavComponent implements OnInit, OnDestroy {
  @Input() isLoggedIn: boolean = false;

  showNavigation: boolean = true;

  navItems: NavItem[] = [
    {
      id: 'games',
      label: 'Games',
      icon: 'rectangle-group',
      route: '/games',
      active: true
    },
    {
      id: 'prize-details',
      label: 'Prize Details',
      icon: 'prize-details',
      route: '/prize-details',
      active: false
    },
    {
      id: 'scan',
      label: 'Scan',
      icon: 'scan',
      route: '/scan',
      active: false
    }
  ];

  private routerSubscription: Subscription | undefined;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateNavigationVisibility(this.router.url);
    this.updateActiveState(this.router.url);

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateNavigationVisibility(event.url);
        this.updateActiveState(event.url);
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateNavigationVisibility(currentUrl: string): void {
    // Show navigation on main app routes when logged in
    const showRoutes = [
      '/games',
      '/prize-details',
      '/scan',
      '/home',
      '/dashboard',
      '/Machine'
    ];

    // Hide navigation on auth routes, modals, etc.
    const hideRoutes = [
      '/login',
      '/register',
      '/forgot-password'
    ];

    const shouldHide = hideRoutes.some(route => currentUrl.includes(route));
    const shouldShow = showRoutes.some(route => currentUrl.includes(route)) || currentUrl === '/';
    console.log('Current URL:', currentUrl, 'Show Navigation:', shouldShow, 'Hide Navigation:', shouldHide);
    this.showNavigation = this.isLoggedIn && !shouldHide && (shouldShow || currentUrl.startsWith('/'));
    console.log('Navigation visibility set to:', this.isLoggedIn, this.showNavigation);
  }

  private updateActiveState(currentUrl: string): void {
    this.navItems.forEach(item => {
      item.active = this.isRouteActive(item.route, currentUrl);
    });
  }

  private isRouteActive(route: string, currentUrl: string): boolean {
    // Simple route matching - can be enhanced based on routing structure
    return currentUrl.includes(route) || currentUrl === route;
  }

  navigateTo(item: NavItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }
}
