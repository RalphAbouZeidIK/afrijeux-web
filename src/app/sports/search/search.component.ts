import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { GamesService } from 'src/app/services/games.service';
import { MachineService } from 'src/app/services/machine.service';
import { NativeBridgeService } from 'src/app/services/native-bridge.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  standalone: false
})
export class SearchComponent implements OnDestroy {

  showSearchBoxBool = false

  searchBoxType = ''

  searchValue = ''

  filtersSubscription: Subscription

  filterObject: any = {}

  fullTicketId: any = null

  constructor(
    private gamesSrv: GamesService,
    private router: Router,
    private nativeBridge: NativeBridgeService,
    private machineSrv: MachineService,
    private cartSrv: CartService
  ) {
    this.filtersSubscription = this.gamesSrv.getSportsFilter().subscribe((data) => {
      this.filterObject = data
    })

    this.nativeBridge.scanResult$.subscribe(result => {
      if (result) {
        this.fullTicketId = result;
        this.searchByTicket()
      }

    });
  }

  showSearchBox(searchBoxType: string) {
    this.showSearchBoxBool = true
    this.searchBoxType = searchBoxType
  }

  submitSearch() {
    switch (this.searchBoxType) {
      case 'gameName':
        if (this.searchValue.trim() != '') {
          this.filterObject.MatchName = this.searchValue
          this.gamesSrv.setSportsFilter(this.filterObject);
        }
        break
      case 'eventCode':
        this.router.navigate([`/Machine/AfrijeuxSportsBetting/EventCodeSearch/${parseInt(this.searchValue)}`])
        break
    }

    this.showSearchBoxBool = false
    this.searchBoxType = ''
    this.searchValue = ''

  }

  async searchByTicket() {
    let params = {
      FullTicketId: this.fullTicketId,
      Language: 'en',
      TicketCode: null
    }
    let apiResponse = await this.machineSrv.getTicketByCode(params)
    console.log(apiResponse)
    if (apiResponse) {
      apiResponse.TerminalPick.forEach((element: any, index: any) => {
        this.cartSrv.setSBBets(element, apiResponse.Stake, index == 0)
      });

    }

  }

  scanCode(): void {
    this.nativeBridge.requestScan();
  }

  ngOnDestroy(): void {
    this.filtersSubscription.unsubscribe;
  }

}
