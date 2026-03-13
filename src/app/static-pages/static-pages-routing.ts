import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomepageComponent } from "./homepage/homepage.component";
import { TicketsComponent } from "../shared/tickets/tickets.component";
import { SharedGuard } from "../shared.guard";

const routes: Routes = [
    {
        path: '',
        component: HomepageComponent,
            children: [
              { path: 'Tickets', component: TicketsComponent, data: { showLink: true, shouldBeLoggedIn: true, title: 'routerLinks.Sports.viewTickets' }, canActivate: [SharedGuard] },
            ]
    },
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [DatePipe],
})
export class routing {
}