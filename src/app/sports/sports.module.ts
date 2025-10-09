import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { CanceledBetsComponent } from './canceled-bets/canceled-bets.component';
import { HomepageComponent } from './homepage/homepage.component';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { MatchDetailsComponent } from './match-details/match-details.component';
import { MatchListComponent } from './match-list/match-list.component';
import { OddItemComponent } from './odd-item/odd-item.component';
import { OutcomesListComponent } from './outcomes-list/outcomes-list.component';
import { OutcomesPageComponent } from './outcomes-page/outcomes-page.component';
import { SportsCoreComponent } from './sports-core/sports-core.component';
import { SportsListComponent } from './sports-list/sports-list.component';
import { routing } from './sports-routing';
import { TicketsComponent } from './tickets/tickets.component';
import { CartComponent } from './cart/cart.component';
import { SearchComponent } from './search/search.component';


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
    CanceledBetsComponent,
    CartComponent,
    SearchComponent
  ],
  imports: [
    routing,
    CommonModule,
    SharedModule
  ]

})
export class SportsModule { }
