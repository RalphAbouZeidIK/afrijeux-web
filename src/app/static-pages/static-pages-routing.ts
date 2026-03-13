import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomepageComponent } from "./homepage/homepage.component";
import { TicketsComponent } from "../shared/tickets/tickets.component";
import { SharedGuard } from "../shared.guard";
import { PagesCoreComponent } from "./pages-core/pages-core.component";

const routes: Routes = [
    {
        path: '',
        component: PagesCoreComponent,
        children: [
            { path: '', component: HomepageComponent, data: { showLink: true, shouldBeLoggedIn: true, title: 'routerLinks.appTitle.mainTitle' } },
            { path: 'Tickets', component: TicketsComponent, data: { showLink: true, shouldBeLoggedIn: true, title: 'routerLinks.appTitle.Tickets' }, canActivate: [SharedGuard] },
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