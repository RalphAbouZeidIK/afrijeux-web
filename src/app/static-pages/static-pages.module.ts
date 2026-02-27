import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { routing } from './static-pages-routing';
import { HomepageComponent } from './homepage/homepage.component';
import { HeroBannerComponent } from './hero-banner/hero-banner.component';
import { GamesListComponent } from './games-list/games-list.component';



@NgModule({
  declarations: [
    HomepageComponent,
    HeroBannerComponent,
    GamesListComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ]
})
export class StaticPagesModule { }
