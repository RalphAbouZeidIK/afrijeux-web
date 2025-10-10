import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-match-list',
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.scss'],
  standalone: false
})
export class MatchListComponent implements OnChanges, OnDestroy {
  @Output() matchForOutcome = new EventEmitter<any>();

  @Input() matchesList: any = []

  cartSubscription: Subscription


  constructor(
    private storageSrv: LocalStorageService,
    private cartSrv: CartService) {

    this.cartSubscription = this.cartSrv.getSBCartData().subscribe((data: any) => {

      // Create a map for matches by MatchId for fast lookup
      const matchMap = new Map(this.matchesList.map((match: any) => [match.MatchId, match]));
      // Set all odds outcomes' isSelected to false
      this.matchesList.forEach((matchItem: any) => {
        matchItem.OddsOutcomes.forEach((oddItem: any) => {
          oddItem.isSelected = false;
        });
      });
      //Now iterate over the data and set isSelected to true for matching odds
      data.forEach((oddItem: any) => {
        const match: any = matchMap.get(oddItem.MatchId);
        if (match) {
          const oddOutcome = match.OddsOutcomes.find((odd: any) => odd.OutcomeId === oddItem.OutcomeId);
          if (oddOutcome) {
            oddOutcome.isSelected = true;
          }
        }
      });
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['matchesList'].firstChange) {
      this.setOddsFromCart(this.storageSrv.getItem('sbCartData'))
    }
  }

  async getOutcomes(matchItem: any) {
    let match = matchItem
    this.matchForOutcome.emit(match)
  }

  setOddsFromCart(oddsList: any) {
    if (oddsList && oddsList.length > 0) {
      oddsList.forEach((oddItem: any) => {
        let matchItem = this.matchesList?.find((match: any) => match.MatchId == oddItem.MatchId)
        if (matchItem) {
          let foundOdd = matchItem.OddsOutcomes.find((odd: any) => odd.OutcomeId == oddItem.OutcomeId)
          if (foundOdd) {
            foundOdd.isSelected = true
          }

        }
      });
    }

  }


  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe;
  }

}
