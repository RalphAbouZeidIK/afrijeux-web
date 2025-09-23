import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { LocalStorageService } from './local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { GenericService } from './generic.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {



  constructor(
    private storageSrv: LocalStorageService,
    private translate: TranslateService,
    private gnrcSrv: GenericService,
    private apiSrv: ApiService
  ) { }
  listOfBets: any = this.storageSrv.getItem('sbCartData') || []

  gameid = 5

  PersonId = 8746

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
  getCartData(): Observable<any> {
    return this.addCartData$;
  }

  /**
   * Function to get the cart data
   * @returns 
   */
  getSBCartData(): Observable<any> {
    return this.addSBCartData$;
  }

  /**
   * Function to get the cart data
   * @returns 
   */
  getEventFromCart(): Observable<any> {
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
    //console.log(race)
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
    let totalMultiplicator = 0
    console.log(cartData)
    cartData.forEach((element: any) => {
      console.log(element.Multiplicator)
      if (element.ShowRace) {
        totalBets++
        totalMultiplicator += element.Multiplicator
      }
    });
    this.storageSrv.setItem('totalBets', totalBets.toString())
    this.storageSrv.setItem('totalMultiplicator', totalMultiplicator.toString())
    this.addCartData$.next(cartData);
  }

  //////////////////////////////HPB BETTING METHODS END//////////////////////////////////////////////////



  //////////////////////////////SPORTS BETTING METHODS START//////////////////////////////////////////////////

  setSBBets(betItem: any) {
    console.log(betItem)
    let existingMatch = this.listOfBets.find((match: any) => match.matchId === betItem.matchId);

    if (existingMatch) {
      if (existingMatch.marketId != betItem.marketId) {
        this.translate.get('alerts.multipleBetsNoAllowed').subscribe((translatedMsg: string) => {
          alert(translatedMsg);
        });
        return
      }

      else if (existingMatch.outcomeId != betItem.outcomeId || (existingMatch.outcomeId == betItem.outcomeId) && (existingMatch.specifiers != betItem.specifiers)) {
        console.log('same market different odd')
        const existingMatchIndex = this.listOfBets.findIndex((match: any) => match.matchId === betItem.matchId);
        this.listOfBets.splice(existingMatchIndex, 1)
        console.log(this.listOfBets)
        this.listOfBets.push(betItem)
      }

      else {
        const existingMatchIndex = this.listOfBets.findIndex((match: any) => match.matchId === betItem.matchId);
        this.listOfBets.splice(existingMatchIndex, 1)
      }

    }

    else {
      this.listOfBets.push(betItem)
    }

    console.log(this.listOfBets)

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

    minimumOddRequired = this.bonusRules[0].minOddRequiered
    //minimumOddRequired = 2
    console.log(minimumOddRequired)
    let multipliedOdds = 1
    let totalBets = 0
    cartData.forEach((element: any) => {
      if (element.odd >= minimumOddRequired) {
        element.hasMinimumOdd = true
      }
      totalBets++
      multipliedOdds *= element.odd
    });
    multipliedOdds = Math.round(multipliedOdds * 100) / 100

    this.storageSrv.setItem('TotaldOdds', multipliedOdds.toString())
    this.storageSrv.setItem('totalBets', totalBets.toString())
    this.addSBCartData$.next(cartData);
  }


  async getBonusRules() {
    const apiResponse = await this.apiSrv.makeApi('OnlineMaster', 'AfrijeuxSportsBetting/GetBonusRules', 'GET', {})
    console.log(apiResponse)
    return apiResponse.data
  }

  removeBetItem(betItem: any) {
    let storageData = this.storageSrv.getItem('sbCartData')
    let matchIndex = storageData.findIndex((itemInStorage: any) => itemInStorage.matchId == betItem.matchId)
    storageData.splice(matchIndex, 1)
    this.listOfBets.splice(matchIndex, 1)
    this.removeCartData(betItem.matchId)
    this.storageSrv.setItem('sbCartData', storageData)
    this.setSBCartDataListener(storageData)
  }

  //////////////////////////////SPORTS BETTING METHODS START//////////////////////////////////////////////////

  clearBets() {
    this.listOfBets = []
    this.addSBCartData$.next(this.listOfBets);
  }


}
