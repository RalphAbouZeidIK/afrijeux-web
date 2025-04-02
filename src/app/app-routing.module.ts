import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SharedGuard } from './shared.guard';
import { ApitestingComponent } from './apitesting/apitesting.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'Testing', component: ApitestingComponent },  
  { path: 'Sports', loadChildren: () => import('./sports/sports.module').then(m => m.SportsModule), canActivate: [SharedGuard], title: 'Affrijeux - Sports Betting', data: { breadcrumb: 'Afrijeux PMU' } },
  { path: 'PMU', loadChildren: () => import('./pmu/pmu.module').then(m => m.PmuModule), canActivate: [SharedGuard], title: 'Affrijeux - PMU', data: { breadcrumb: 'Afrijeux PMU' } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
