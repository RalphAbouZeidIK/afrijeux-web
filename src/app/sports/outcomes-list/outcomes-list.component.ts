import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-outcomes-list',
  templateUrl: './outcomes-list.component.html',
  styleUrls: ['./outcomes-list.component.scss'],
  standalone:false
})
export class OutcomesListComponent implements OnChanges {
  @Input() outcomesList: any

  @Input() matchDetails: any

  selectedMatchId: any

  cartSubscription: Subscription

  constructor(private cartSrv: CartService, private storageSrv: LocalStorageService) {

    this.cartSubscription = this.cartSrv.getSBCartData().subscribe((data) => {
      // Create a map for matches by MatchId for fast lookup
      console.log(this.outcomesList)
      // Set all odds outcomes' isSelected to false
      this.outcomesList.forEach((outcomeItem: any) => {
        outcomeItem.oddsOutcomes.forEach((oddItem: any) => {
          oddItem.isSelected = false;
        });
      });

      //Now iterate over the data and set isSelected to true for matching odds
      data.forEach((oddItem: any) => {
        if (oddItem.matchId == this.selectedMatchId) {
          const oddMarket = this.outcomesList.find((odd: any) => odd.marketId === oddItem.marketId);
          console.log(oddMarket.oddsOutcomes.filter((odd: any) => (odd.specifiers === oddItem.specifiers) && (odd.outcomeId === oddItem.outcomeId)))
          const oddOutcome = oddMarket.oddsOutcomes.find((odd: any) => (odd.specifiers === oddItem.specifiers) && (odd.outcomeId === oddItem.outcomeId));
          if (oddOutcome) {
            oddOutcome.isSelected = true;
          }
        }

      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)

    if (!changes['matchDetails'].firstChange) {
      this.selectedMatchId = changes['matchDetails'].currentValue.eventId
    }

    if (!changes['outcomesList'].firstChange) {
      this.setOddsFromCart(this.storageSrv.getItem('sbCartData'))
    }
  }

  setOddsFromCart(oddsList: any) {
    if (oddsList && oddsList.length > 0) {
      oddsList.forEach((oddItem: any) => {
        if (oddItem.matchId == this.selectedMatchId) {
          const oddMarket = this.outcomesList.find((odd: any) => odd.marketId === oddItem.marketId);
          const oddOutcome = oddMarket.oddsOutcomes.find((odd: any) => (odd.specifiers === oddItem.specifiers) && (odd.outcomeId === oddItem.outcomeId));
          if (oddOutcome) {
            oddOutcome.isSelected = true;
          }
        }
      });
    }
  }

}
