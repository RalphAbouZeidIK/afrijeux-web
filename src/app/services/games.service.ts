import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  PersonId = 8746

  MachineId = 2338

  gameObject: any

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

  async issueTicket(ticketObject: any) {
    await this.getGame()
    let date = new Date()
    let ticketRequestId = Math.floor(Math.random() * 1e12).toString() + this.gnrcSrv.getFormattedToday() + this.gameObject.GameId
    ticketRequestId = ("00000000000000000000000000000000000" + ticketRequestId).substring(ticketRequestId.length);

    let ticketBody = {
      GameId: this.gameObject.GameId,
      FullTicketId: '',
      EncryptedTicketKey: '',
      IsVoucher: 0,
      Stake: ticketObject.TicketPrice,
      MachineId: this.MachineId,
      PersonId: this.PersonId,
      MachineTicketId: 0,
      MachineDateIssued: date.toISOString(),
      ServiceDateIssued: date.toISOString(),
      TicketRequestId: ticketRequestId,
      GamePick: ticketObject,
      LoyalityReferenceId: 0,
      ReferenceId: '',
      IsPromotion: false,
      PromotionRuleId: 0,
    }

    let issueTicketRequest = {
      GameId: this.gameObject.GameId,
      PersonId: this.PersonId,
      MachineId: this.MachineId,
      Ticket: ticketBody,
      TicketRequestId: ticketRequestId,
      LoyalityReferenceId: 0,
      TimeStamp: 'string',
    }


    let params = {
      body: {
        "timeStamp": "string",
        "issueTicketRequest": issueTicketRequest,
        "ip": "10.1.3.254",
        "culture": "en",
        "currency": 4,
        "amount": ticketBody.Stake
      }
    }
    console.log(params)

    try {
      const apiResponse = await this.apiSrv.makeApi(`OnlineMaster`, `HPBPMU/IssueTicket`, 'POST', params)
      console.log(apiResponse)
      if (apiResponse.status) {
        return apiResponse
      }
      console.log(apiResponse)
    } catch (error) {
      console.log(error)
    }
  }
}
