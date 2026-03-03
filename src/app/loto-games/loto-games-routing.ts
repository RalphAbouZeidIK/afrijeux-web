import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomepageComponent } from "./homepage/homepage.component";
import { LotoGamesCoreComponent } from "./loto-games-core/loto-games-core.component";
import { SharedGuard } from "../shared.guard";


const routes: Routes = [
    {
        path: '',
        component: LotoGamesCoreComponent,
        children: [
            { path: '', component: HomepageComponent, data: { showLink: false, shouldBeLoggedIn: true, title: 'routerLinks.Sports.viewTickets' }, canActivate: [SharedGuard] },
        ]
    },
]



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [DatePipe],
})
export class routing {
}