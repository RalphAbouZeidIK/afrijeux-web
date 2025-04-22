import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedGuard } from './shared.guard';

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


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
