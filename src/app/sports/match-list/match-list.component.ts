import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CartService } from 'src/app/services/cart.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-match-list',
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.scss'],
  standalone: false
})
export class MatchListComponent implements OnChanges {
  @Output() matchForOutcome = new EventEmitter<any>();

  @Input() matchesList: any = []

  cartSubscription: Subscription

  constructor(private apiSrv: ApiService, private storageSrv: LocalStorageService, private cartSrv: CartService) {

    this.cartSubscription = this.cartSrv.getSBCartData().subscribe((data) => {

      // Create a map for matches by MatchId for fast lookup
      const matchMap = new Map(this.matchesList.map((match: any) => [match.matchId, match]));
      // Set all odds outcomes' isSelected to false
      this.matchesList.forEach((matchItem: any) => {
        matchItem.oddsOutcomes.forEach((oddItem: any) => {
          oddItem.isSelected = false;
        });
      });
      //Now iterate over the data and set isSelected to true for matching odds
      data.forEach((oddItem: any) => {
        const match: any = matchMap.get(oddItem.matchId);
        if (match) {
          const oddOutcome = match.oddsOutcomes.find((odd: any) => odd.outcomeId === oddItem.outcomeId);
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
        let matchItem = this.matchesList.find((match: any) => match.matchId == oddItem.matchId)
        if (matchItem) {
          let foundOdd = matchItem.oddsOutcomes.find((odd: any) => odd.outcomeId == oddItem.outcomeId)
          if (foundOdd) {
            foundOdd.isSelected = true
          }

        }
      });
    }

  }

}
