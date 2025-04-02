import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { LocalStorageService } from './local-storage.service';
import { GenericService } from './generic.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  gameid = 5

  PersonId = 8746

  bonusRules: any = []

  listOfBets: any = this.storageSrv.getItem('cartData') || []

  pmuBets: any = this.storageSrv.getItem('pmuCartData') || []

  constructor(
    private storageSrv: LocalStorageService,
    private gnrcSrv: GenericService,
    private apiSrv: ApiService
  ) { }

  /**
 * cart subscriber
 */
  private addCartData$ = new Subject();

  private removeCartData$ = new Subject();

  /**
   * Function to get the cart data
   * @returns 
   */
  getCartData(): Observable<any> {
    return this.addCartData$;
  }

  /**
   * Set Cart Data
   * @param cartData 
   */
  async setCartDataListener(cartData: any) {
    let minimumOddRequired: any = 0
    if (this.bonusRules.length == 0) {
      this.bonusRules = await this.getBonusRules(this.PersonId, this.gameid)
    }

    minimumOddRequired = this.bonusRules[0].MinOddRequiered
    //minimumOddRequired = 2
    console.log(minimumOddRequired)
    let multipliedOdds = 1
    let totalBets = 0
    cartData.forEach((element: any) => {
      if (element.Odd >= minimumOddRequired) {
        element.hasMinimumOdd = true
      }
      totalBets++
      multipliedOdds *= element.Odd
    });
    multipliedOdds = Math.round(multipliedOdds * 100) / 100

    this.storageSrv.setItem('TotaldOdds', multipliedOdds.toString())
    this.storageSrv.setItem('totalBets', totalBets.toString())
    this.addCartData$.next(cartData);
  }

  /**
   * Set Cart Data
   * @param cartData 
   */
  removeCartData(matchId: any) {
    this.removeCartData$.next(matchId);
  }

  /**
   * Set Cart Data
   * @param cartData 
   */
  removeCartDataListener() {
    return this.removeCartData$;
  }

  setListOfBets(betItem: any) {
    console.log(betItem)
    let existingMatch = this.listOfBets.find((match: any) => match.MatchId === betItem.MatchId);

    if (existingMatch) {
      if (existingMatch.MarketId != betItem.MarketId) {
        alert('Multiple bets on same match currently not allowed')
        return
      }

      else if (existingMatch.OutcomeId != betItem.OutcomeId || (existingMatch.OutcomeId == betItem.OutcomeId) && (existingMatch.Specifiers != betItem.Specifiers)) {
        console.log('same market different odd')
        const existingMatchIndex = this.listOfBets.findIndex((match: any) => match.MatchId === betItem.MatchId);
        this.listOfBets.splice(existingMatchIndex, 1)
        console.log(this.listOfBets)
        this.listOfBets.push(betItem)
      }

      else {
        const existingMatchIndex = this.listOfBets.findIndex((match: any) => match.MatchId === betItem.MatchId);
        this.listOfBets.splice(existingMatchIndex, 1)
      }

    }

    else {
      this.listOfBets.push(betItem)
    }

    console.log(this.listOfBets)

    this.setCartDataListener(this.listOfBets)
    this.storageSrv.setItem('cartData', this.listOfBets)
  }

  removeBetItem(betItem: any) {
    let storageData = this.storageSrv.getItem('cartData')
    let matchIndex = storageData.findIndex((itemInStorage: any) => itemInStorage.MatchId == betItem.MatchId)
    storageData.splice(matchIndex, 1)
    this.listOfBets.splice(matchIndex, 1)
    this.removeCartData(betItem.MatchId)
    this.storageSrv.setItem('cartData', storageData)
    this.setCartDataListener(storageData)
  }


  async getBonusRules(personId: any, gameId: any) {
    let params = {
      PersonId: personId,
      GameId: gameId,
      TimeStamp: this.gnrcSrv.getFormattedToday(),
    }

    const apiResponse = await this.apiSrv.makeApi('AfrijeuxSportsBetting', 'AfrijeuxSportsBetting/GetBonusRules', 'POST', params)
    console.log(apiResponse)
    return apiResponse
  }

  // setPmuBets(race: any, horse: any, typeOfBetName: any, fixedConfig: any) {
  //   let existingRace: any;
  //   console.log(existingRace)
  //   if (existingRace == undefined) {
  //     let newRace: any = {
  //       GameEventId: race.GameEventId,
  //       raceTitle: race.EventName,
  //       betTypeName: typeOfBetName,
  //       listOfHorses: [],
  //       multiplicator: 1,
  //       fixedConfig: fixedConfig
  //     }

  //     if (horse) {
  //       newRace.listOfHorses.push(horse)
  //     }

  //     this.pmuBets.push(newRace)
  //   }

  //   else {

  //     if (!horse) {
  //       existingRace.betTypeName = typeOfBetName
  //       existingRace.fixedConfig = fixedConfig
  //     }
  //     else {
  //       let horseId = horse.id
  //       const existingHorseIndex = existingRace.listOfHorses.findIndex((horse: any) => horse.id === horseId);
  //       if (existingHorseIndex !== -1) {
  //         existingRace.listOfHorses.splice(existingHorseIndex, 1)
  //       }
  //       else {
  //         existingRace.listOfHorses.push(horse)
  //       }
  //     }

  //   }

  //   existingRace = this.pmuBets.find((raceItem: any) => raceItem.GameEventId === race.GameEventId);
  //   if ((existingRace.listOfHorses.length == 0) && !existingRace.betTypeName) {
  //     let raceIndex = this.pmuBets.findIndex((raceItem: any) => raceItem.GameEventId == race.GameEventId)
  //     this.pmuBets.splice(raceIndex, 1)
  //   }
  //   else {
  //     if ((existingRace.listOfHorses.length == 0) || !existingRace.betTypeName) {
  //       existingRace.showRace = false
  //       existingRace.multiplicator = 1
  //     }
  //     else {
  //       existingRace.multiplicator = 1
  //       existingRace.showRace = true
  //     }
  //   }
  //   console.log(this.pmuBets)
  //   this.addCartData$.next(this.pmuBets[0]);
  //   // this.storageSrv.setItem('pmuCartData', this.pmuBets)

  // }

  setPmuBets(race: any) {
    if ((race.horses.find((horse: any) => horse.isSelected == true) == undefined) || (race.FixedConfiguration.find((item: any) => item.isSelected == true) == undefined)) {
      race.showRace = false
    }
    else {
      race.showRace = true
    }
    race.listOfHorses = race.horses.filter((horse: any) => horse.isSelected == true)
    race.selectedFixedConfig = race.FixedConfiguration.find((item: any) => item.isSelected == true)
    this.addCartData$.next(race);
  }

  updateMultiplicator(betItem: any, value: any) {
    betItem.multiplicator += value
    this.addCartData$.next(betItem);
  }



  clearBets() {
    this.storageSrv.removeItem('cartData')
    this.listOfBets = []
    this.setCartDataListener(this.listOfBets)
  }


}
