import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { routing } from './static-pages-routing';
import { HomepageComponent } from './homepage/homepage.component';
import { HeroBannerComponent } from './hero-banner/hero-banner.component';
import { GamesListComponent } from './games-list/games-list.component';
import { PreviousResultsComponent } from './previous-results/previous-results.component';
import { PromoHeroComponent } from './promo-hero/promo-hero.component';
import { ResponsibleGamingBannerComponent } from './responsible-gaming-banner/responsible-gaming-banner.component';
import { PagesCoreComponent } from './pages-core/pages-core.component';



@NgModule({
  declarations: [
    PagesCoreComponent,
    HomepageComponent,
    HeroBannerComponent,
    GamesListComponent,
    PreviousResultsComponent,
    PromoHeroComponent,
    ResponsibleGamingBannerComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ]
})
export class StaticPagesModule { }
