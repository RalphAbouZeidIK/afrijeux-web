import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { routing } from './machine-routing';
import { MachineCoreComponent } from './machine-core/machine-core.component';
import { PopupComponent } from "src/app/shared/popup/popup.component";
import { GamesComponent } from './games/games.component';



@NgModule({
  declarations: [MachineCoreComponent, GamesComponent],
  imports: [
    routing,
    CommonModule,
    SharedModule,
    PopupComponent
  ]
})
export class MachineModule { }
