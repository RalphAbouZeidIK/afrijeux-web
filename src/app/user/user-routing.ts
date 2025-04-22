import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UserCoreComponent } from "./user-core/user-core.component";
import { DepositComponent } from "./deposit/deposit.component";
import { MesPariesPopupComponent } from "./mes-paries-popup/mes-paries-popup.component";
import { WithdrawComponent } from "./withdraw/withdraw.component";
import { UserRouteConfig } from "../services/routing.service";


const routes: Routes = [
  {
    path: '',
    redirectTo: UserRouteConfig.deposit.path,
    pathMatch: 'full'
  },
  {
    path: '',
    component: UserCoreComponent,
    title: UserRouteConfig.deposit.title,
    children: [
      {
        path: UserRouteConfig.deposit.path,
        component: DepositComponent,

        data: { showLink: true, title: UserRouteConfig.deposit.title, }
      },
      {
        path: UserRouteConfig.withdraw.path,
        component: WithdrawComponent,

        data: { showLink: UserRouteConfig.withdraw.showLink, title: UserRouteConfig.withdraw.title }
      },
      {
        path: UserRouteConfig.myBets.path,
        component: MesPariesPopupComponent,

        data: { showLink: UserRouteConfig.myBets.showLink, title: UserRouteConfig.myBets.title, }
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