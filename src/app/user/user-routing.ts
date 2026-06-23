import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UserCoreComponent } from "./user-core/user-core.component";
import { DepositComponent } from "./deposit/deposit.component";
import { MesPariesPopupComponent } from "./mes-paries-popup/mes-paries-popup.component";
import { WithdrawComponent } from "./withdraw/withdraw.component";
import { UserRouteConfig } from "../services/routing.service";
import { TicketsComponent } from "../shared/tickets/tickets.component";
import { ProfileComponent } from "./profile/profile.component";


const routes: Routes = [
  {
    path: '',
    redirectTo: UserRouteConfig.profile.path,
    pathMatch: 'full'
  },
  {
    path: '',
    component: UserCoreComponent,
    title: UserRouteConfig.profile.title,
    children: [
      {
        path: UserRouteConfig.profile.path,
        component: ProfileComponent,

        data: { showLink: true, title: UserRouteConfig.profile.title, }
      },
      {
        path: UserRouteConfig.tickets.path,
        component: TicketsComponent,

        data: { showLink: UserRouteConfig.tickets.showLink, title: UserRouteConfig.tickets.title, }
      },

      {
        path: UserRouteConfig.logout.path,
        component: DepositComponent,

        data: { showLink: UserRouteConfig.logout.showLink, title: UserRouteConfig.logout.title, }
      }
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