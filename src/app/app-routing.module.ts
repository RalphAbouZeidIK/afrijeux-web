import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedGuard } from './shared.guard';
import { DatePipe } from '@angular/common';
import { LoginComponent } from './shared/login/login.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { UofComponent } from './sports/uof/uof.component';
import { TicketsComponent } from './shared/tickets/tickets.component';
import { ResultsComponent } from './shared/results/results.component';
import { PlayResponsiblyComponent } from './static-pages/play-responsibly/play-responsibly.component';

const routes: Routes = [
  // Main entry routes
  {
    path: '',
    loadChildren: () => import('./static-pages/static-pages.module').then(m => m.StaticPagesModule),
    data: {
      breadcrumb: 'UAE Lottery',
      shouldBeLoggedIn: false,
      showLink: false,
      title: 'routerLinks.appTitle.mainTitle',
    }
  },
  {
    path: 'Uof',
    component: UofComponent,
    data: { showLink: false, title: 'routerLinks.Sports.uof' }
  },

  {
    path: 'HPBPMU',
    loadChildren: () => import('./pmu/pmu.module').then(m => m.PmuModule),
    data: {
      breadcrumb: 'HPB PMU',
      shouldBeLoggedIn: true,
      showLink: false,
      title: 'routerLinks.appTitle.hpb',
    }
  },
  {
    path: 'PMUHybrid',
    loadChildren: () => import('./pmu/pmu.module').then(m => m.PmuModule),
    data: {
      breadcrumb: 'PMU Hybrid',
      shouldBeLoggedIn: true,
      showLink: false,
      title: 'routerLinks.appTitle.pmu',
    }
  },
  {
    path: 'Sports',
    loadChildren: () => import('./sports/sports.module').then(m => m.SportsModule),
    data: {
      breadcrumb: 'Sports Betting',
      shouldBeLoggedIn: false,
      showLink: false,
      title: 'routerLinks.appTitle.Sports',
    }
  },
  {
    path: 'AfrijeuxFiveNinetyV2',
    loadChildren: () => import('./khamsa/khamsa.module').then(m => m.KhamsaModule),
    data: {
      breadcrumb: 'Five Ninety',
      shouldBeLoggedIn: true,
      showLink: false,
      title: 'routerLinks.appTitle.Khamsa',
    }
  },
  {
    path: 'PickX',
    loadChildren: () => import('./loto-games/loto-games.module').then(m => m.LotoGamesModule),
    data: {
      breadcrumb: 'PickX',
      shouldBeLoggedIn: false,
      showLink: true,
      title: 'routerLinks.appTitle.Pickx',
    }
  },
  {
    path: 'Jackpot',
    loadChildren: () => import('./loto-games/loto-games.module').then(m => m.LotoGamesModule),
    data: {
      breadcrumb: 'Jackpot',
      shouldBeLoggedIn: false,
      showLink: true,
      title: 'routerLinks.appTitle.Jackpot',
    }
  },
  {
    path: 'User',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canActivate: [SharedGuard],
    data: {
      breadcrumb: 'My profile',
      shouldBeLoggedIn: true,
      showLink: false,
      title: 'routerLinks.appTitle.User',
    },
  },
  {
    path: 'Results',
    component: ResultsComponent,
    data: {
      breadcrumb: 'Results',
      shouldBeLoggedIn: false,
      showLink: true,
      title: 'routerLinks.appTitle.Results',
    },
  },
  {
    path: 'play-responsibly',
    component: PlayResponsiblyComponent,
    data: {
      breadcrumb: 'Play Responsibly',
      shouldBeLoggedIn: false,
      showLink: true,
      title: 'routerLinks.appTitle.PlayResponsibly',
    },
  },
  // Machine-prefixed versions
  {
    path: 'Machine',
    data: {
      breadcrumb: 'Machine',
      showLink: false,
      title: 'routerLinks.appTitle.Machine'
    },
    loadChildren: () => import('./machine/machine.module').then(m => m.MachineModule),
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [DatePipe, { provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule { }
