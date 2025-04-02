import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { OutcomesPageComponent } from './outcomes-page/outcomes-page.component';
import { OddItemComponent } from './odd-item/odd-item.component';
import { HomepageComponent } from './homepage/homepage.component';
import { MatchDetailsComponent } from './match-details/match-details.component';
import { MatchListComponent } from './match-list/match-list.component';
import { OutcomesListComponent } from './outcomes-list/outcomes-list.component';
import { SportsListComponent } from './sports-list/sports-list.component';
import { routing } from './sports-routing';
import { SportsCoreComponent } from './sports-core/sports-core.component';
import { SharedModule } from '../shared/shared.module';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { TicketsComponent } from './tickets/tickets.component';
import { CanceledBetsComponent } from './canceled-bets/canceled-bets.component';



@NgModule({
  declarations: [
    MatchListComponent,
    HomepageComponent,
    SportsListComponent,
    OutcomesListComponent,
    MatchDetailsComponent,
    OddItemComponent,
    OutcomesPageComponent,
    SportsCoreComponent,
    LeftMenuComponent,
    TicketsComponent,
    CanceledBetsComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ]

})
export class SportsModule { }
