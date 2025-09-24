import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { routing } from './machine-routing';
import { MachineCoreComponent } from './machine-core/machine-core.component';
import { PopupComponent } from "src/app/shared/popup/popup.component";
import { GamesComponent } from './games/games.component';
import { HomeComponent } from './home/home.component';
import { ValidateTicketComponent } from './validate-ticket/validate-ticket.component';



@NgModule({
  declarations: [MachineCoreComponent, GamesComponent, HomeComponent, ValidateTicketComponent],
  imports: [
    routing,
    CommonModule,
    SharedModule,
    PopupComponent
  ]
})
export class MachineModule { }
