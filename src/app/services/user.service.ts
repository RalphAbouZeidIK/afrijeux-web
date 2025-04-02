import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

/**
 * Service that has the main user functions 
 */
@Injectable({
  providedIn: 'root'
})

export class UserService {
  /**
   * login status subscriber
   */
  private loginStatus$ = new Subject();

  /**
   * Variable used to store user data
   */
  private userData: any = {};

  /**
    * Variable used to store the session expiry date
    */
  sessionExpiryDate: any;

  /**
   * Service that has the main user functions 
   * @param localStorageSrv 
   */
  constructor(private localStorageSrv: LocalStorageService) { }

  /**
   * Function to get the login status subsciber
   * @returns 
   */
  getLoginStatus(): Observable<any> {
    return this.loginStatus$;
  }

  /**
   * Change the login status subscriber
   * @param {Boolean} status login status true or false
   */
  setLoginStatus(status: boolean) {
    this.loginStatus$.next(status);
  }

  /**
   * Set session expiry date on login
   * @param date 
   */
  setAccountExpiry(date: any) {
    let newDate = date.setSeconds(date.getSeconds() + this.localStorageSrv.getItem('user_data', true).userInfo.expirationDate);
    this.localStorageSrv.setItem('expiryDate', newDate, true)
  }

  /**
   * Method to return wether the session is expired or not 
   * @returns 
   */
  sessionExpired() {
    const currentDate = new Date()
    if (currentDate.getTime() >= this.localStorageSrv.getItem('expiryDate', true)) {
      return true
    }
    else {
      return false
    }
  }

  /**
   * Update user data where needed
   */
  updateLocalUser() {
    this.localStorageSrv.setItem('user_data', this.userData, true)
  }

  /**
   * Clear user data 
   */
  clearUser() {
    this.userData = {}
    this.updateLocalUser()
  }

  /**
   * Setting user token on login 
   * @param token 
   */
  setUserToken(token: string) {
    this.userData.token = token;
    this.updateLocalUser()
  }

  /**
   * Getting user token where needed
   * @returns 
   */
  getUserToken() {
    const userToken = this.localStorageSrv.getItem('user_data', true);

    return (userToken != '' && userToken !== undefined) ? userToken.token : '';
  }

  /**
   * Function to return if user is logged in or not 
   * @returns 
   */
  isUserLoggedIn(): boolean {
    return (this.getUserToken() == '') ? false : true;

  }

  /**
   * Setting user data after login
   * @param data 
   */
  setUserData(data: any) {
    this.userData.userInfo = data;
    this.updateLocalUser()
  }

  /**
   * Getting user data where needed
   * @returns 
   */
  getUserData() {
    const userData = this.localStorageSrv.getItem('user_data', true);
    return (userData != '' && userData !== undefined) ? userData.userInfo : '';
  }

  /**
   * Remove user data and sign out 
   */
  signOut() {
    this.localStorageSrv.clear();
    this.setLoginStatus(false);
  }

}
