import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './pickx-routing';
import { SharedModule } from '../shared/shared.module';
import { LotoGamesModule } from '../loto-games/loto-games.module';
import { HomepageComponent } from './homepage/homepage.component';
import { PickxCoreComponent } from './pickx-core/pickx-core.component';



@NgModule({
  declarations: [
    HomepageComponent,
    PickxCoreComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule,
    LotoGamesModule
  ]
})
export class PickxModule { }
