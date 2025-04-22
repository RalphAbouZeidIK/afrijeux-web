import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomepageComponent } from "./homepage/homepage.component";
import { OutcomesPageComponent } from "./outcomes-page/outcomes-page.component";
import { SportsCoreComponent } from "./sports-core/sports-core.component";
import { TicketsComponent } from "./tickets/tickets.component";
import { CanceledBetsComponent } from "./canceled-bets/canceled-bets.component";


const routes: Routes = [
  {
    path: '',
    redirectTo: '1',  // Redirect to 'courses-libanaises' by default
    pathMatch: 'full'  // Ensure this redirect happens for the root of the submodule
  },
  {
    path: '',
    component: SportsCoreComponent,
    children: [
      { path: 'Tickets', component: TicketsComponent, data: { showLink: true, title: 'routerLinks.Sports.viewTickets' } },
      { path: 'Canceled-Bets', component: CanceledBetsComponent, data: { showLink: true, title: 'routerLinks.Sports.canceledBets' } },
      { path: ':sportId/Categories/:categoryId/Tournaments/:tournamentId', component: HomepageComponent, data: { showLink: false, title: 'routerLinks.Sports.matchList' } },
      { path: ':sportId/Categories/:categoryId', component: HomepageComponent, data: { showLink: false, title: 'routerLinks.Sports.matchList' } },
      { path: ':sportId/Categories/:categoryId/Tournaments/:tournamentId/Outcomes/:matchId', component: OutcomesPageComponent, data: { showLink: false, title: 'routerLinks.Sports.matchList' } },
      { path: ':sportId/Outcomes/:matchId', component: OutcomesPageComponent, data: { showLink: false, title: 'routerLinks.Sports.matchList' } },
      { path: ':sportId', component: HomepageComponent, data: { showLink: false, title: 'routerLinks.Sports.matchList' } },
    ]
  }

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DatePipe],
})
export class routing {
}