import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { GamesService } from './games.service';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(
    private storageSrv: LocalStorageService,
    private translate: TranslateService,
    private gamesSrv: GamesService,
    private gnrcSrv: GenericService
  ) { }

  listOfBets: any = this.storageSrv.getItem('sbCartData') || []

  listOfLotoBets: any = []

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

  private showOnClickMobile$ = new Subject();

  isAndroidApp = this.gnrcSrv.isMachineApp()

  getShowOnClickMobileListener() {
    return this.showOnClickMobile$;
  }

  setShowOnClickMobile(data: any) {
    this.showOnClickMobile$.next(data)
  }


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
    let totalMultiplier = 0
    //console.log(cartData)
    cartData.forEach((element: any) => {
      //console.log(element.Multiplier)
      if (element.ShowRace) {
        totalBets++
        totalMultiplier += element.Multiplier
      }
    });
    this.storageSrv.setItem('totalBets', totalBets.toString())
    this.storageSrv.setItem('totalMultiplier', totalMultiplier.toString())
    this.addCartData$.next(cartData);
  }


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
        //console.log('same market different odd')
        const existingMatchIndex = this.listOfBets.findIndex((match: any) => match.MatchId === betItem.MatchId);
        this.listOfBets.splice(existingMatchIndex, 1)
        //console.log(this.listOfBets)
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

    //console.log(this.listOfBets)
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
    //console.log(minimumOddRequired)
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
    //console.log('cart data')
    //console.log(cartData)
    this.addSBCartData$.next(cartData);
  }


  async getBonusRules() {
    const apiResponse = await this.gamesSrv.getBonusRules()
    //console.log(apiResponse)
    return apiResponse
  }

  removeBetItem(betItem: any) {
    let storageData = this.storageSrv.getItem('sbCartData')
    let matchIndex = storageData.findIndex((itemInStorage: any) => itemInStorage.MatchId == betItem.MatchId)
    storageData.splice(matchIndex, 1)
    this.listOfBets.splice(matchIndex, 1)
    this.removeCartData(betItem.MatchId)
    this.storageSrv.setItem('lotoCartData', storageData)
    this.setSBCartDataListener(storageData)
  }

  //////////////////////////////SPORTS BETTING METHODS START//////////////////////////////////////////////////

  ////////////////////////////////LOTO METHODS START//////////////////////////////////////////////////
  private getLotoStorageKey(gameName: string | null | undefined): string {
    const normalized = (gameName || '').toString().toLowerCase();
    return normalized ? `lotoCartData_${normalized}` : 'lotoCartData';
  }

  private getGameEventIdFromUrl(href: string): string | null {
    // supports both regular and hash-based routes:
    // /PickX?gameEventId=12345 and /#/PickX?gameEventId=12345
    const match = href.match(/[?&]gameEventId=([^&#]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
  }

  private getGameNameFromEvent(eventItem: any): string | null {
    if (!eventItem) {
      return null;
    }

    const gameEventId = eventItem?.GameEventId;
    if (gameEventId != null && gameEventId !== '') {
      return `gameevent_${gameEventId}`;
    }

    const eventName = (eventItem?.EventName || eventItem?.name || eventItem?.gameName || '').toString().toLowerCase();
    if (eventName.includes('jackpot')) {
      return 'jackpot';
    }

    return null;
  }

  getCurrentLotoStorageKey(selectedEvent?: any): string {
    const gameNameFromEvent = this.getGameNameFromEvent(selectedEvent);
    if (gameNameFromEvent) {
      return this.getLotoStorageKey(gameNameFromEvent);
    }

    const href = window.location.href;

    if (href.includes('Jackpot')) {
      return this.getLotoStorageKey('jackpot');
    }

    if (href.includes('PickX')) {
      const gameEventId = this.getGameEventIdFromUrl(href);
      if (gameEventId) {
        return this.getLotoStorageKey(`gameevent_${gameEventId}`);
      }

      // backward compatibility for old URLs using gametype
      const legacyGameType = href.match(/[?&]gametype=([^&#]+)/i);
      if (legacyGameType?.[1]) {
        return this.getLotoStorageKey(`pick${decodeURIComponent(legacyGameType[1])}`);
      }
    }

    return 'lotoCartData';
  }

  getCurrentLotoCartData(selectedEvent?: any): any[] {
    const currentKey = this.getCurrentLotoStorageKey(selectedEvent);
    const currentData = this.storageSrv.getItem(currentKey);
    if (Array.isArray(currentData)) {
      return currentData;
    }

    // backward compatibility with previous single-key storage
    const legacy = this.storageSrv.getItem('lotoCartData');
    return Array.isArray(legacy) ? legacy : [];
  }

  updateLotoList(pickItem: any, id: any = null) {

    const storageKey = pickItem?.gameEventId != null
      ? this.getLotoStorageKey(`gameevent_${pickItem.gameEventId}`)
      : this.getLotoStorageKey(pickItem?.gameName);
    if (id != null) {
      let storageData = this.storageSrv.getItem(storageKey) || []
      const index = storageData.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        storageData[index] = pickItem;
      }
      this.listOfLotoBets = [...storageData]
      this.storageSrv.setItem(storageKey, storageData)
      this.addCartData$.next(storageData);
      return
    }
    this.listOfLotoBets = this.storageSrv.getItem(storageKey) || []
    this.listOfLotoBets.push(pickItem)
    //console.log(this.listOfLotoBets)
    if(!this.isAndroidApp){
      this.storageSrv.setItem(storageKey, this.listOfLotoBets)
    }
    this.storageSrv.setItem(storageKey, this.listOfLotoBets)
    this.addCartData$.next(this.listOfLotoBets);
    //console.log(this.listOfLotoBets)
  }


  removeLotoBetItem(betItem: any, index: any, selectedEvent?: any) {
    const storageKey = this.getCurrentLotoStorageKey(selectedEvent);
    let storageData = this.storageSrv.getItem(storageKey) || []
    storageData.splice(index, 1)
    this.listOfLotoBets = [...storageData]
    this.storageSrv.setItem(storageKey, storageData)
    this.addCartData$.next(storageData);
  }

  clearCurrentLotoBets(selectedEvent?: any) {
    const storageKey = this.getCurrentLotoStorageKey(selectedEvent);
    this.listOfLotoBets = [];
    this.storageSrv.removeItem(storageKey);
    this.addCartData$.next([]);
  }

  clearAllLotoBets() {
    ['lotoCartData', 'lotoCartData_pick2', 'lotoCartData_pick3', 'lotoCartData_pick4', 'lotoCartData_pick5', 'lotoCartData_jackpot']
      .forEach((key) => this.storageSrv.removeItem(key));

    this.clearStorageByPrefix('lotoCartData_gameevent_');
  }

  private clearStorageByPrefix(prefix: string) {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }

    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(prefix)) {
        sessionStorage.removeItem(key);
      }
    }
  }


  ///////////////////////////////LOTO METHODS END//////////////////////////////////////////////////

  clearBets() {
    this.listOfBets = []
    this.listOfLotoBets = []
    this.clearAllLotoBets()
    this.addSBCartData$.next(this.listOfBets);
    this.addCartData$.next(this.listOfBets);
  }


}
