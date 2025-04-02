import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GameEventsComponent } from "./game-events/game-events.component";
import { PmuCoreComponent } from "./pmu-core/pmu-core.component";
import { RaceDetailsComponent } from "./race-details/race-details.component";


const routes: Routes = [
    {
      path: '',
      component: PmuCoreComponent,
      children: [
        { path: 'Events/:eventId', component: RaceDetailsComponent },
        { path: 'Events', component: GameEventsComponent },
        
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