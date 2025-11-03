import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { ApiService } from './api.service';
import { Subject, Observable } from 'rxjs';
import { MachineService } from './machine.service';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  gameObject: any

  isAndroidApp = this.gnrcSrv.isMachineApp()

  private sportsFilter$ = new Subject();

  outcomesFromCodeSearch: any

  constructor(
    private gnrcSrv: GenericService,
    private apiSrv: ApiService,
    private machineSrv: MachineService
  ) {
  }

  async getGame() {
    let apiRespnse = await this.gnrcSrv.getGame('HPBPMU')
    this.gameObject = apiRespnse
    return apiRespnse
  }

  async getGameEvents(date: any, country: any) {

    const params = {
      body: {
        "date": date,
        "reunion": country
      }
    }
    ////console.log(params)

    let gameEventsResponse = await this.apiSrv.makeApi(`OnlineMaster`, `HPBPMU/GetEventConfiguration`, 'POST', params)
    return gameEventsResponse
  }


  async getResults(date: any) {
    await this.getGame()
    const params = {
      body: {
        "date": date,
        "gameId": this.gameObject.GameId,
      }
    }
    ////console.log(params)

    let resultsResponse = await this.apiSrv.makeApi(`OnlineMaster`, `HPBPMU/GetEventResult`, 'POST', params)
    ////console.log(resultsResponse)
    resultsResponse.forEach((eventItem: any) => {
      eventItem.horsesArray = eventItem.horsesResults.map((resultItem: any) => Object.values(resultItem))
    })
    // Example usage
    const groupedItems = this.groupByProperty(resultsResponse, 'reunionCode');
    return groupedItems
  }

  groupByProperty(items: any[], property: string): any[] {
    const grouped = items.reduce((result, currentItem) => {
      const key = currentItem[property];  // Group by 'events'

      // If the key doesn't exist, initialize it as an array
      if (!result[key]) {
        result[key] = [];
      }

      // Push the current item to the array for the respective event
      result[key].push(currentItem);

      return result;
    }, {});

    // Convert grouped object into an array of objects with 'name' and 'events'
    return Object.keys(grouped).map(key => ({
      name: key,  // The name of the event
      events: grouped[key],  // The array of items for that event,
      isOpen: false
    }));
  }


  /**
   * Function to get the login status subsciber
   * @returns 
   */
  getSportsFilter(): Observable<any> {
    return this.sportsFilter$;
  }

  /**
   * Change the login status subscriber
   * @param {any} filterObject login status true or false
   */
  setSportsFilter(filterObject: any) {
    this.sportsFilter$.next(filterObject);
  }


  async getFiltersLists() {
    let apiResponse: any
    if (this.isAndroidApp) {
      apiResponse = await this.machineSrv.getFiltersLists()
      return apiResponse
    }
    else {
      apiResponse = await this.apiSrv.makeApi('OnlineMaster', `AfrijeuxSportsBetting/GetFiltersLists?language=en`, 'GET', {})
      return apiResponse
    }

  }

  async getMatches(apiParams: any) {
    let apiResponse: any = []
    if (this.isAndroidApp) {
      apiResponse = await this.machineSrv.getMatches(apiParams)
    }
    else {
      apiParams = {
        body: apiParams
      }
      apiResponse = await this.apiSrv.makeApi('OnlineMaster', 'AfrijeuxSportsBetting/GetMatchListByName', 'POST', apiParams)
    }
    return apiResponse
  }

  async getOutcomesListByMatchId(apiParams: any) {
    let apiResponse: any = []
    if (this.isAndroidApp) {
      apiResponse = await this.machineSrv.getOutcomesListByMatchId(apiParams)
    }
    else {
      apiParams = {
        body: apiParams
      }
      apiResponse = await this.apiSrv.makeApi('OnlineMaster', 'AfrijeuxSportsBetting/GetOutcomesListByMatchId', 'POST', apiParams)
    }
    return apiResponse
  }

  async getOutcomesListByMatchCode(apiParams: any) {
    let apiResponse: any = []
    if (this.isAndroidApp) {
      apiResponse = await this.machineSrv.getOutcomesListByMatchCode(apiParams)
    }
    else {
      apiParams = {
        body: apiParams
      }
      apiResponse = await this.apiSrv.makeApi('OnlineMaster', 'AfrijeuxSportsBetting/GetOutcomesListByMatchId', 'POST', apiParams)
    }
    this.outcomesFromCodeSearch = apiResponse
    return apiResponse
  }

  async getBonusRules() {
    let apiResponse: any = []
    if (this.isAndroidApp) {
      apiResponse = await this.machineSrv.getBonusRules()
      apiResponse = apiResponse.data
    }
    else {
      apiResponse = await this.apiSrv.makeApi('OnlineMaster', 'AfrijeuxSportsBetting/GetBonusRules', 'GET', {})
    }
    ////console.log(apiResponse)
    return apiResponse
  }



}
