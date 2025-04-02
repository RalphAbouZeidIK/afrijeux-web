import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './pmu-routing';
import { GameEventsComponent } from './game-events/game-events.component';
import { PmuCoreComponent } from './pmu-core/pmu-core.component';
import { RaceDetailsComponent } from './race-details/race-details.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    GameEventsComponent,
    PmuCoreComponent,
    RaceDetailsComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ]
})
export class PmuModule { }
