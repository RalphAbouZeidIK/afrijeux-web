import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCoreComponent } from './user-core/user-core.component';
import { SharedModule } from '../shared/shared.module';
import { routing } from './user-routing';
import { MesPariesPopupComponent } from './mes-paries-popup/mes-paries-popup.component';
import { DepositComponent } from './deposit/deposit.component';
import { WithdrawComponent } from './withdraw/withdraw.component';



@NgModule({
  declarations: [
    UserCoreComponent,
    MesPariesPopupComponent,
    DepositComponent,
    WithdrawComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ]
})
export class UserModule { }
