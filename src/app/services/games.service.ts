import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  PersonId = 8746

  constructor(
    private gnrcSrv: GenericService,
    private apiSrv: ApiService
  ) { }

  async getGame() {
    let apiRespnse = await this.gnrcSrv.getGameId('HPBPMU')
    return apiRespnse
  }

  async getGameEvents() {
    let gameObject = await this.getGame()

    let params: any = {
      PersonId: this.PersonId,
      GameId: gameObject.gameId,
      GameConfiguration: [],
      TimeStamp: this.gnrcSrv.getFormattedToday(),
      UserOnlineStatus: true
    }

    let gameEventsResponse = await this.apiSrv.makeApi(`${gameObject.apiRout}`, `${gameObject.apiRout}/GetEventConfiguration`, 'POST', params)
    return gameEventsResponse
  }

  async getFixedConfiguration(fixedConfigurationId: any) {
    let gameObject = await this.getGame()

    let params: any = {
      PersonId: this.PersonId,
      GameId: gameObject.gameId,
      GameConfiguration: [],
      TimeStamp: this.gnrcSrv.getFormattedToday(),
      UserOnlineStatus: true,
      FixedConfigurationId: fixedConfigurationId
    }
    let gameEventsResponse1 = await this.apiSrv.makeApi(`${gameObject.apiRout}`, `${gameObject.apiRout}/GetFixedConfiguration`, 'POST', params)
    return gameEventsResponse1.FixedConfiguration.FixedEventConfiguration
  }
}
