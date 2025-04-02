import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GenericService {

  constructor(private apiSrv: ApiService) { }

  getFormattedToday() {
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    return `${month}${day}${year}${hours}${minutes}${seconds}${milliseconds}`;
  }

  async getFiltersLists() {
    let params = {
      Language: 'en',
    }
    const apiResponse = await this.apiSrv.makeApi('AfrijeuxSportsBetting', 'AfrijeuxSportsBetting/GetFiltersLists', 'POST', params)
    return apiResponse
  }


  /**
   * Get url's first path
   * @returns 
   */
  getFirstPathName() {
    const path = location.pathname.split('/')[1];
    return path
  }

  /**
   * Get url's first path
   * @returns 
   */
  async getGameId(apiRout: any) {
    const apiResponse = await this.apiSrv.makeApi('master', 'Game/Index', 'GET', {}, true);
    const gameId = apiResponse.find((item: any) => item.apiRout == apiRout);
    return gameId
  }

}
