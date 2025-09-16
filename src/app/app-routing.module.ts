import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedGuard } from './shared.guard';
import { DatePipe } from '@angular/common';
import { LoginComponent } from './shared/login/login.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

const routes: Routes = [
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
    path: 'Sports',
    loadChildren: () => import('./sports/sports.module').then(m => m.SportsModule),
    title: 'Affrijeux - Sports Betting',
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
  {
    path: 'Machine',
    loadChildren: () => import('./machine/machine.module').then(m => m.MachineModule),
    data: {
      breadcrumb: 'Machine',
      title: 'routerLinks.appTitle.Machine',
    }
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [DatePipe, { provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule { }
