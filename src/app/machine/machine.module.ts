import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { routing } from './machine-routing';
import { MachineCoreComponent } from './machine-core/machine-core.component';
import { PopupComponent } from "src/app/shared/popup/popup.component";
import { HomeComponent } from './home/home.component';
import { ValidateTicketComponent } from './validate-ticket/validate-ticket.component';
import { ReportsComponent } from './reports/reports.component';
import { RapidGamesComponent } from './rapid-games/rapid-games.component';
import { A11yModule } from "@angular/cdk/a11y";



@NgModule({
  declarations: [
    MachineCoreComponent,
    HomeComponent,
    ValidateTicketComponent,
    ReportsComponent,
    RapidGamesComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule,
    PopupComponent,
    A11yModule
]
})
export class MachineModule { }
