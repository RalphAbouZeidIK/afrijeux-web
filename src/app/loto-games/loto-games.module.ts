import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './loto-games-routing';
import { SharedModule } from '../shared/shared.module';
import { HomepageComponent } from './homepage/homepage.component';



@NgModule({
  declarations: [
    HomepageComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ],
  exports: [HomepageComponent]
})
export class LotoGamesModule { }