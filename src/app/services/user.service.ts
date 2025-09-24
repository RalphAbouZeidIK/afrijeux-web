import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { jwtDecode } from "jwt-decode";
import { Router } from '@angular/router';
import { CacheService } from './cache.service';
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

  private loginPopup$ = new Subject();

  private userBalance$ = new Subject();

  /**
   * Variable used to store user data
   */
  private userData: any = {};

  /**
    * Variable used to store the session expiry date
    */
  sessionExpiryDate: any;

  isAndroidApp = this.isMachineApp()

  /**
   * Service that has the main user functions 
   * @param localStorageSrv 
   */
  constructor(
    private localStorageSrv: LocalStorageService,
    private router: Router,
    private cacheSrv: CacheService
  ) { }

  isMachineApp() {
    const currentUrl: any = window.location.href;
    return currentUrl.includes('Machine') || (!navigator.onLine)
  }

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
   * Change the login status subscriber
   * @param {Boolean} status login status true or false
   */
  setLoginPopupStatus(status: any) {
    this.loginPopup$.next(status);
  }

  /**
   * Function to get the login status subsciber
   * @returns 
   */
  getLoginPopupStatus(): Observable<any> {
    return this.loginPopup$;
  }

  setUserBalance(balance: any) {
    this.userBalance$.next(balance);
  }

  getUserBalance(): Observable<any> {
    return this.userBalance$;
  }



  /**
   * Set session expiry date on login
   * @param date 
   */
  setAccountExpiry(date: any) {
    let newDate = date.setSeconds(date.getSeconds() + 50000);
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
  async getUserToken() {
    let userToken: any = ''

    if (this.isAndroidApp) {
      let userData: any
      userData = await this.cacheSrv.getFromFlutterOfflineCache('user_data')
      userToken = (userData) ? userData.jwtToken : ''
    }

    else {
      userToken = this.localStorageSrv.getItem('user_data', true).token;
    }

    return (userToken != '' && userToken !== undefined) ? userToken : '';
  }

  /**
   * Function to return if user is logged in or not 
   * @returns 
   */
  async isUserLoggedIn() {
    let isLoggedIn: any = (await this.getUserToken() == '') ? false : true
    return isLoggedIn;

  }


  /**
   * Notifications subject, to update notifications where needed 
   */
  private $notificationSb = new Subject();

  /**
   * Function to call when notifications need to be updated
   * @returns 
   */
  $notifyUsers(): Observable<any> {
    return this.$notificationSb
  }

  /**
   * Trigger notications subscriber
   * @param notification 
   */
  triggerNotification(notification: any) {
    this.$notificationSb.next(notification);
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
   * Get user id from token
   */
  gettUserId() {
    let token = this.localStorageSrv.getItem('user_data', true).token
    let decoded: any = jwtDecode(token);
    console.log(decoded)
    return decoded.PersonId
  }

  /**
   * Remove user data and sign out 
   */
  signOut() {
    this.localStorageSrv.setItem('isLoggedIn', 'false')
    this.localStorageSrv.removeItem('user_data');
    this.localStorageSrv.removeItem('expiryDate');
    this.router.navigate(['']);
    this.setLoginStatus(false);
  }

}


