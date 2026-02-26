import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  standalone: false
})
export class NavComponent implements OnInit, AfterViewInit {
  @Input() navList: any

  @Input() parentClass: any

  @Input() fullMenu: any

  constructor(private router: Router) { }

  ngOnInit(): void {
    console.log('NavComponent initialized with navList:', this.fullMenu);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => this.updateHeaderClass(), 150); // Delay to ensure DOM is updated
      });
  }

  ngAfterViewInit() {
    // Also check once on initial load
    setTimeout(() => this.updateHeaderClass(), 50);
  }

  updateHeaderClass() {
    const header = document.querySelector('header');
    const body = document.querySelector('body');
    const activeTopItem = document.querySelector('.header-nav > ul > li.active');

    if (!header) return;
    if (!body) return;

    if (activeTopItem && activeTopItem.querySelector('.sub-nav-holder')) {
      header.classList.add('has-sub-nav');
      body.classList.add('menu-with-sub-nav');
    } else {
      header.classList.remove('has-sub-nav');
      body.classList.remove('menu-with-sub-nav');
    }
  }
}
