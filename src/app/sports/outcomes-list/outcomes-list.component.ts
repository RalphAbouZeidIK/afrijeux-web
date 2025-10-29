import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-outcomes-list',
  templateUrl: './outcomes-list.component.html',
  styleUrls: ['./outcomes-list.component.scss'],
  standalone: false
})
export class OutcomesListComponent implements OnChanges, OnInit, OnDestroy {
  @Input() OutcomesList: any

  @Input() MatchDetails: any

  selectedMatchId: any

  cartSubscription: Subscription

  constructor(private cartSrv: CartService, private storageSrv: LocalStorageService) {

    this.cartSubscription = this.cartSrv.getSBCartData().subscribe((data: any) => {
      // Create a map for matches by MatchId for fast lookup
      //console.log(this.OutcomesList)
      // Set all odds outcomes' isSelected to false
      console.log(data)
      this.OutcomesList.forEach((outcomeItem: any) => {
        outcomeItem.OddsOutcomes.forEach((oddItem: any) => {
          oddItem.isSelected = false;
        });
      });

      //Now iterate over the data and set isSelected to true for matching odds
      data.forEach((oddItem: any) => {
        if (oddItem.MatchId == this.selectedMatchId) {
          const oddMarket = this.OutcomesList.find((odd: any) => odd.MarketId === oddItem.MarketId);

          //console.log(oddMarket.OddsOutcomes.filter((odd: any) => (odd.Specifiers === oddItem.Specifiers) && (odd.OutcomeId === oddItem.OutcomeId)))
          const oddOutcome = oddMarket.OddsOutcomes.find((odd: any) => (odd.Specifiers === oddItem.Specifiers) && (odd.OutcomeId === oddItem.OutcomeId));
          if (oddOutcome) {
            oddOutcome.isSelected = true;
          }
        }

      });
    });
  }

  ngOnInit() {
    this.selectedMatchId = this.MatchDetails.EventId
    this.setOddsFromCart(this.storageSrv.getItem('sbCartData'))
    console.log(this.selectedMatchId)
  }

  ngOnChanges(changes: SimpleChanges): void {
    //console.log(changes)

    if (!changes['MatchDetails'].firstChange) {
      this.selectedMatchId = changes['MatchDetails'].currentValue.EventId
    }

    if (!changes['OutcomesList'].firstChange) {
      this.setOddsFromCart(this.storageSrv.getItem('sbCartData'))
    }
  }

  setOddsFromCart(oddsList: any) {
    if (oddsList && oddsList.length > 0) {
      oddsList.forEach((oddItem: any) => {
        if (oddItem.MatchId == this.selectedMatchId) {
          const oddMarket = this.OutcomesList.find((odd: any) => odd.MarketId === oddItem.MarketId);
          const oddOutcome = oddMarket.OddsOutcomes.find((odd: any) => (odd.Specifiers === oddItem.Specifiers) && (odd.OutcomeId === oddItem.OutcomeId));
          if (oddOutcome) {
            oddOutcome.isSelected = true;
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
  }


}
