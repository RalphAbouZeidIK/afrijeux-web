import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { ApiService } from './api.service';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  PersonId = 8746

  MachineId = 2338

  gameObject: any

  private sportsFilter$ = new Subject();

  constructor(
    private gnrcSrv: GenericService,
    private apiSrv: ApiService
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
    console.log(params)

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
    console.log(params)

    let resultsResponse = await this.apiSrv.makeApi(`OnlineMaster`, `HPBPMU/GetEventResult`, 'POST', params)
    console.log(resultsResponse)
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


}
