import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './loto-games-routing';
import { SharedModule } from '../shared/shared.module';
import { HomepageComponent } from './homepage/homepage.component';
import { LotoGamesCoreComponent } from './loto-games-core/loto-games-core.component';
import { GameBlockComponent } from './game-block/game-block.component';
import { GameBannerComponent } from './game-banner/game-banner.component';
import { GameOverviewComponent } from './game-overview/game-overview.component';
import { GameHowtoComponent } from './game-howto/game-howto.component';
import { GamePlaytypesComponent } from './game-playtypes/game-playtypes.component';
import { GamePrizeSummaryComponent } from './game-prize-summary/game-prize-summary.component';
import { GameDetailsComponent } from './game-details/game-details.component';
import { GameIntroComponent } from './game-intro/game-intro.component';



@NgModule({
  declarations: [
    HomepageComponent,
    LotoGamesCoreComponent,
    GameBlockComponent,
    GameBannerComponent,
    GameOverviewComponent,
    GameHowtoComponent,
    GamePlaytypesComponent,
    GamePrizeSummaryComponent,
    GameDetailsComponent,
    GameIntroComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ],
  exports: [HomepageComponent]
})
export class LotoGamesModule { }