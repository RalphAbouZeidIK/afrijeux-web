import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomepageComponent } from "./homepage/homepage.component";
import { LotoGamesCoreComponent } from "./loto-games-core/loto-games-core.component";
import { PrizeDetailsPageComponent } from "../static-pages/prize-details-page/prize-details-page.component";


const routes: Routes = [
    {
        path: '',
        component: LotoGamesCoreComponent,
        children: [
            { path: '', component: HomepageComponent, data: { showLink: false, shouldBeLoggedIn: true, title: 'Winbig' } },
        ]
    },
    {
        path: 'Prize-Details',
        component: PrizeDetailsPageComponent,
        data: {
            breadcrumb: 'Prize-Details',
            shouldBeLoggedIn: false,
            showLink: true,
            title: 'routerLinks.appTitle.prizeDetails',
        },
    },
]



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [DatePipe],
})
export class routing {
}