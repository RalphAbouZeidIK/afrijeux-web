import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './loto-games-routing';
import { SharedModule } from '../shared/shared.module';
import { HomepageComponent } from './homepage/homepage.component';
import { LotoGamesCoreComponent } from './loto-games-core/loto-games-core.component';



@NgModule({
  declarations: [
    HomepageComponent,
    LotoGamesCoreComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ],
  exports: [HomepageComponent]
})
export class LotoGamesModule { }