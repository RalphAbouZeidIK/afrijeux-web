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
    component: SportsCoreComponent,
    children: [
      { path: 'Tickets', component: TicketsComponent },
      { path: 'Canceled-Bets', component: CanceledBetsComponent },
      { path: ':sportId/Categories/:categoryId/Tournaments/:tournamentId', component: HomepageComponent },
      { path: ':sportId/Categories/:categoryId', component: HomepageComponent },
      { path: ':sportId/Categories/:categoryId/Tournaments/:tournamentId/Outcomes/:matchId', component: OutcomesPageComponent },
      { path: ':sportId/Outcomes/:matchId', component: OutcomesPageComponent },
      { path: ':sportId', component: HomepageComponent },
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