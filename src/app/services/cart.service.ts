import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { GamesService } from './games.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(
    private storageSrv: LocalStorageService,
    private translate: TranslateService,
    private gamesSrv: GamesService
  ) { }

  listOfBets: any = this.storageSrv.getItem('sbCartData') || []

  listOfPMUBets: any = this.storageSrv.getItem('cartData') || []

  bonusRules: any = []

  /**
 * cart subscriber
 */
  private addCartData$ = new Subject();

  /**
 * cart subscriber
 */
  private addSBCartData$ = new Subject();

  /**
 * cart subscriber
 */
  private eventFromCart$ = new Subject();

  private removeCartData$ = new Subject();

  private resetOtherEvents$ = new Subject();


  /**
   * Function to get the cart data
   * @returns 
   */
  getCartData() {
    return this.addCartData$;
  }

  /**
   * Function to get the cart data
   * @returns 
   */
  getSBCartData() {
    return this.addSBCartData$;
  }

  /**
   * Function to get the cart data
   * @returns 
   */
  getEventFromCart() {
    return this.eventFromCart$;
  }


  /**
   * Set Cart Data
   * @param cartData 
   */
  removeCartData(raceId: any) {
    this.removeCartData$.next(raceId);
  }

  /**
   * Set Cart Data
   * @param cartData 
   */
  removeCartDataListener() {
    return this.removeCartData$;
  }

  //////////////////////////////HPB BETTING METHODS START//////////////////////////////////////////////////

  setPmuBets(race: any, eventFromCart?: true) {
    //////console.log(race)
    if (eventFromCart) {
      this.eventFromCart$.next(race);
      return
    }
    this.addCartData$.next(race);
  }

  getResetOtherEvents() {
    return this.resetOtherEvents$;
  }

  setResetOtherEvents(data: any) {
    this.resetOtherEvents$.next(data)
  }

  /**
     * Set Cart Data
     * @param cartData 
     */
  setCartDataListener(cartData: any) {
    let totalBets = 0
    let totalMultiplier = 0
    ////console.log(cartData)
    cartData.forEach((element: any) => {
      ////console.log(element.Multiplier)
      if (element.ShowRace) {
        totalBets++
        totalMultiplier += element.Multiplier
      }
    });
    this.storageSrv.setItem('totalBets', totalBets.toString())
    this.storageSrv.setItem('totalMultiplier', totalMultiplier.toString())
    this.addCartData$.next(cartData);
  }


  // updateMultiplier(betItem: any, isAdd: any) {
  //   let fullData = this.listOfPMUBets
  //   //console.log(fullData)
  //   //console.log(betItem)
  //   let race = fullData.find((itemInStorage: any) => itemInStorage.raceId == betItem.raceId)
  //   if (isAdd) {
  //     race.Multiplier++
  //     this.storageSrv.setItem('cartData', fullData)
  //     this.setCartDataListener(fullData)
  //     return
  //   }
  //   race.Multiplier--
  //   this.storageSrv.setItem('cartData', fullData)
  //   this.setCartDataListener(fullData)
  // }

  //////////////////////////////HPB BETTING METHODS END//////////////////////////////////////////////////



  //////////////////////////////SPORTS BETTING METHODS START//////////////////////////////////////////////////

  setSBBets(betItem: any, StakeFromSearch: any = 200, clearBets: any = false) {
    //console.log(betItem)
    if (clearBets) {
      this.clearBets()
    }
    let existingMatch = this.listOfBets.find((match: any) => match.MatchId === betItem.MatchId);

    if (existingMatch) {
      if (existingMatch.MarketId != betItem.MarketId) {
        this.translate.get('alerts.multipleBetsNoAllowed').subscribe((translatedMsg: string) => {
          alert(translatedMsg);
        });
        return
      }

      else if (existingMatch.OutcomeId != betItem.OutcomeId || (existingMatch.OutcomeId == betItem.OutcomeId) && (existingMatch.Specifiers != betItem.Specifiers)) {
        ////console.log('same market different odd')
        const existingMatchIndex = this.listOfBets.findIndex((match: any) => match.MatchId === betItem.MatchId);
        this.listOfBets.splice(existingMatchIndex, 1)
        ////console.log(this.listOfBets)
        betItem.StakeFromSearch = StakeFromSearch
        this.listOfBets.push(betItem)
      }

      else {
        const existingMatchIndex = this.listOfBets.findIndex((match: any) => match.MatchId === betItem.MatchId);
        this.listOfBets.splice(existingMatchIndex, 1)
      }

    }

    else {
      betItem.StakeFromSearch = StakeFromSearch
      this.listOfBets.push(betItem)
    }

    ////console.log(this.listOfBets)
    //console.log(betItem)
    this.setSBCartDataListener(this.listOfBets)
    this.storageSrv.setItem('sbCartData', this.listOfBets)
  }


  /**
   * Set Cart Data
   * @param cartData 
   */
  async setSBCartDataListener(cartData: any) {
    let minimumOddRequired: any = 0
    if (this.bonusRules.length == 0) {
      this.bonusRules = await this.getBonusRules()
    }

    minimumOddRequired = this.bonusRules[0].MinOddRequiered
    //minimumOddRequired = 2
    ////console.log(minimumOddRequired)
    let multipliedOdds = 1
    let totalBets = 0
    cartData.forEach((element: any) => {
      if (element.Odd >= minimumOddRequired) {
        element.HasMinimumOdd = true
      }
      totalBets++
      multipliedOdds *= element.Odd
    });
    multipliedOdds = Math.round(multipliedOdds * 100) / 100

    this.storageSrv.setItem('TotaldOdds', multipliedOdds.toString())
    this.storageSrv.setItem('totalBets', totalBets.toString())
    ////console.log('cart data')
    ////console.log(cartData)
    this.addSBCartData$.next(cartData);
  }


  async getBonusRules() {
    const apiResponse = await this.gamesSrv.getBonusRules()
    ////console.log(apiResponse)
    return apiResponse
  }

  removeBetItem(betItem: any) {
    let storageData = this.storageSrv.getItem('sbCartData')
    let matchIndex = storageData.findIndex((itemInStorage: any) => itemInStorage.MatchId == betItem.MatchId)
    storageData.splice(matchIndex, 1)
    this.listOfBets.splice(matchIndex, 1)
    this.removeCartData(betItem.MatchId)
    this.storageSrv.setItem('sbCartData', storageData)
    this.setSBCartDataListener(storageData)
  }

  //////////////////////////////SPORTS BETTING METHODS START//////////////////////////////////////////////////

  clearBets() {
    this.listOfBets = []
    this.addSBCartData$.next(this.listOfBets);
  }


}
