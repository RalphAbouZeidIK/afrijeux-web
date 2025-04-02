import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ApiService } from '../services/api.service';

/**
 * Login main component
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  /**
    * Flag to show error message
    */
  showErrorMessage = false

  /**
   * Variable to store redirection urls after login
   */
  urlparams = '';

  /**
   * 
   * Show password flag
   */
  showPassword = false;

  /**
   * Login component with the related services
   * @param usrSrv 
   * @param http 
   * @param route 
   * @param router 
   */
  constructor(
    private usrSrv: UserService,
    private router: Router,
    private actvRoute: ActivatedRoute,
    private apiSrv: ApiService,
  ) { }

  /**
   * On component initialize
   */
  ngOnInit(): void {
    this.usrSrv.signOut()
    /**
     * Get query params from URL to redirect where needed 
     */
    this.actvRoute.queryParams.subscribe((params: any) => {
      this.urlparams = params.redirectUrl
    });

    /** If the user is logged in redirect to home page */
    if (this.usrSrv.getUserData() !== '') {
      this.router.navigate(['/Dashboard']);
    }
  }

  /**
   * Login data as form group
   */
  loginForm = new FormGroup({
    UserName: new FormControl('', Validators.required),
    Password: new FormControl('', Validators.required),
    ip: new FormControl('10.1.3.254', Validators.required),
  })

  /**
   * Submit login method on login click
   */
  async submitLogin() {
    if (this.loginForm.invalid) {
      this.showErrorMessage = true
      return
    }
    let loginParams = this.loginForm.value
    try {
      const loginResponse = await this.login(loginParams)
      console.log(loginResponse)
      this.successfullLogin(loginResponse, loginResponse.token)
    } catch (error: any) {
      if (error.error.status != undefined && error.error.status == 401) {
        this.showErrorMessage = true
      }
    }
  }

  login(loginParams: any) {
    const params = {
      body: loginParams

    }
    return this.apiSrv.makeApi('auth', 'login', 'POST', params, true);
  }

  /**
   * Submit on enter key press
   * @param event 
   */
  keyDownFunction(event: any) {
    if (event.keyCode === 13) {
      this.submitLogin()
    }
  }

  /**
   * Function called after successfull login
   * 
   * Set the user data in storage and redirect to the correct page
   * 
   * In case the redirectURL param is set in the query strings redirect to this page
   * else redirect to dashboard
   * @param userData 
   * @param token 
   * @returns 
   */
  private successfullLogin(userData: any, token: string) {
    let currentDate = new Date()
    this.usrSrv.setUserToken(token)
    this.usrSrv.setUserData(userData)
    this.usrSrv.setLoginStatus(true)
    this.usrSrv.setAccountExpiry(currentDate)
    /** in case a pram is set redirect to this specific page */
    if (this.urlparams !== '' && this.urlparams !== undefined) {
      this.router.navigate([this.urlparams]);
      return;
    }
    else {
      this.router.navigate(['Sports/1'])
    }
  }

}
