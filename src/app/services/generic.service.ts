import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenericService {

  constructor(private apiSrv: ApiService, private usrSrv: UserService, private router: Router) { }

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

  /**
     * Get url's first path
     * @returns 
     */
  getFirstPathName() {
    const path = location.pathname.split('/')[1];
    return path
  }

  isMachineApp() {
    const currentUrl: any = window.location.href;
    return currentUrl.includes('Machine') || (!navigator.onLine)
  }

  /**
   * login status subscriber
   */
  private isDesktop$ = new Subject();

  getIsDesktopView() {
    return window.innerWidth > 1200;
  }

  getIsDesktopViewListener() {
    return this.isDesktop$;
  }

  setIsDesktopView(value: boolean) {
    this.isDesktop$.next(value);
  }


  /**
   * Get url's first path
   * @returns 
   */
  async getGame(apiRout: any) {
    const apiResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'Corporate/GetOnlineGames', 'GET', {});
    const game = apiResponse.find((item: any) => item.APIRout == apiRout);
    //console.log(game)
    return game
  }

  async getBalance() {
    let balance = await this.apiSrv.makeApi(`OnlineMaster`, `UserInfo/GetBalance`, 'GET', {})
    //console.log(balance)
    return balance
  }

  async refreshToken() {
    const apiResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'Authenticate/RefreshToken', 'GET', {});

    const token = apiResponse.userInfo.token
    const userData = apiResponse.userInfo
    let currentDate = new Date()

    this.usrSrv.setUserToken(token)

    this.usrSrv.setUserData(userData)
    this.usrSrv.setLoginStatus(true)
    this.usrSrv.setAccountExpiry(currentDate)
  }


  calculateCombinations(associatedHorsesNumber: any, baseHorsesNumber: any, minHorseNumber: any, IsAllOrder: any) {
    let combinationsNumber = 1;

    const IsDoubleComplete = baseHorsesNumber === 0 && IsAllOrder;

    if (minHorseNumber === 1) {
      return associatedHorsesNumber;
    }

    for (let i = associatedHorsesNumber; i > associatedHorsesNumber - (minHorseNumber - baseHorsesNumber); --i) {
      combinationsNumber *= i;
    }

    if (IsAllOrder) {
      for (let i = minHorseNumber; i > minHorseNumber - baseHorsesNumber; --i) {
        combinationsNumber *= i;
      }
    } else {
      if (baseHorsesNumber === 0) {
        for (let i = minHorseNumber; i > 1; --i) {
          combinationsNumber /= i;
        }
      }
    }

    if (IsDoubleComplete) {
      for (let i = minHorseNumber; i > minHorseNumber - baseHorsesNumber; --i) {
        combinationsNumber *= i;
      }
    }

    return (combinationsNumber == -0) ? 0 : combinationsNumber;
  }

  async getTransactionTypes() {
    const apiResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'Corporate/GetAllTransactionType', 'GET', {});
    return apiResponse
  }

  async updateBalance(params: any) {
    const apiResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'UserInfo/UpdateBalance', 'POST', params);
    return apiResponse
  }

  async getCurrencies() {
    const apiResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'Corporate/GetAllCurrencies', 'GET', {});
    return apiResponse
  }

}
