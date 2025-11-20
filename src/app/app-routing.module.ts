import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedGuard } from './shared.guard';
import { DatePipe } from '@angular/common';
import { LoginComponent } from './shared/login/login.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

const routes: Routes = [
  // Main entry routes
  { path: '', redirectTo: 'HPBPMU', pathMatch: 'full', data: { showLink: false } },
  {
    path: 'HPBPMU',
    loadChildren: () => import('./pmu/pmu.module').then(m => m.PmuModule),
    data: {
      breadcrumb: 'HPB PMU',
      shouldBeLoggedIn: false,
      showLink: true,
      title: 'routerLinks.appTitle.hpb',
    }
  },
  {
    path: 'PMUHybrid',
    loadChildren: () => import('./pmu/pmu.module').then(m => m.PmuModule),
    data: {
      breadcrumb: 'PMU Hybrid',
      shouldBeLoggedIn: false,
      showLink: true,
      title: 'routerLinks.appTitle.pmu',
    }
  },
  {
    path: 'Sports',
    loadChildren: () => import('./sports/sports.module').then(m => m.SportsModule),
    data: {
      breadcrumb: 'Sports Betting',
      shouldBeLoggedIn: false,
      showLink: true,
      title: 'routerLinks.appTitle.Sports',
    }
  },
  {
    path: 'AfrijeuxFiveNinetyV2',
    loadChildren: () => import('./khamsa/khamsa.module').then(m => m.KhamsaModule),
    data: {
      breadcrumb: 'Five Ninety',
      shouldBeLoggedIn: false,
      showLink: true,
      title: 'routerLinks.appTitle.Khamsa',
    }
  },
  {
    path: 'User',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canActivate: [SharedGuard],
    data: {
      breadcrumb: 'My profile',
      shouldBeLoggedIn: true,
      showLink: true,
      title: 'routerLinks.appTitle.User',
    }
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
