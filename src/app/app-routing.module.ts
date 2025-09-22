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
      breadcrumb: 'HPB PMU',
      shouldBeLoggedIn: false,
      showLink: true,
      title: 'routerLinks.appTitle.hpb',
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
    children: [
      {
        path: '',
        loadChildren: () => import('./machine/machine.module').then(m => m.MachineModule),
        data: {
          breadcrumb: 'Machine',
          title: 'routerLinks.appTitle.Machine',
        }
      },
      {
        path: 'HPBPMU',
        loadChildren: () => import('./pmu/pmu.module').then(m => m.PmuModule),
        data: { breadcrumb: 'HPB PMU (Machine)', showLink: true }
      },
      {
        path: 'Sports',
        loadChildren: () => import('./sports/sports.module').then(m => m.SportsModule),
        data: { breadcrumb: 'Sports (Machine)', showLink: true }
      },
      {
        path: 'User',
        loadChildren: () => import('./user/user.module').then(m => m.UserModule),
        canActivate: [SharedGuard],
        data: { breadcrumb: 'My profile (Machine)', showLink: true }
      },
      {
        path: 'PMUHybrid',
        loadChildren: () => import('./pmu/pmu.module').then(m => m.PmuModule),
        data: { breadcrumb: 'HPB PMU (Machine)', showLink: true }
      },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [DatePipe, { provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule { }
