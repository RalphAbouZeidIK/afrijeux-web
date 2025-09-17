import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ageValidator } from 'src/app/ageValidator';
import { ApiService } from 'src/app/services/api.service';
import { GenericService } from 'src/app/services/generic.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { MachineService } from 'src/app/services/machine.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnChanges, OnInit {


  isSignup: any;


  @Input() loginObject: any

  signupForm: FormGroup | any;

  isAndroidApp = false


  constructor(
    private router: Router,
    private storageSrv: LocalStorageService,
    private apiSrv: ApiService,
    private usrSrv: UserService,
    private gnrcSrv: GenericService,
    private fb: FormBuilder,
    private machineSrv: MachineService
  ) {

  }
  msg = ''
  showErrorMessage = false

  loginForm = new FormGroup({
    UserName: new FormControl('', [Validators.required]),
    Password: new FormControl('', [Validators.required]),
    Ip: new FormControl('10.1.3.254', Validators.required),
  });

  ngOnInit(): void {
    this.isAndroidApp = this.gnrcSrv.isMachineApp()
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // Simple phone validation
      dateOfBirth: ['', [Validators.required, ageValidator()]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator // Custom validator for matching passwords
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isSignup = (changes['loginObject'].currentValue.type == 'signup');
    console.log(changes['loginObject'].currentValue)
  }

  preventTyping(event: KeyboardEvent) {
    event.preventDefault(); // Prevents any typing input
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (confirmPassword?.errors && !confirmPassword.errors['passwordMismatch']) {
      return null;
    }
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  hidePopup() {
    this.usrSrv.setLoginPopupStatus({
      show: false,
      type: this.isSignup ? 'signup' : 'login'
    })
  }

  swtichToSignUp(value: boolean) {
    this.isSignup = value
    this.showErrorMessage = false
  }

  /**
 * Submit login method on login click
 */
  async submitLogin() {
    if (this.loginForm.invalid) {
      this.showErrorMessage = true
      return
    }
    let loginParams = this.loginForm.value
    if (this.isAndroidApp) {
      let respoonse = await this.machineSrv.loginMachine(loginParams)
      if (respoonse.status == false) {
        this.machineSrv.setModalData(true, false, respoonse.message)
      }
      else{
        this.router.navigate(['Machine/PMUHybrid/Courses'])
      }
      console.log(respoonse)
    }
    else {
      try {
        const loginResponse = await this.login(loginParams)
        console.log(loginResponse)
        if (loginResponse.isSuccess) {
          this.successfullLogin(loginResponse.userInfo, loginResponse.userInfo.token)
        }
        else {
          this.showErrorMessage = true
        }
      } catch (error: any) {
        if (error.error.status != undefined && error.error.status == 401) {
          this.showErrorMessage = true
        }
      }
    }

  }

  async submitSignUp() {
    console.log(this.signupForm)
    if (this.signupForm.invalid) {
      this.showErrorMessage = true
      return
    }
    let signupParams = this.signupForm.value
    const params = {
      body: signupParams

    }
    try {
      const signupResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'Authenticate/Register', 'POST', params);
      console.log(signupResponse)
      if (signupResponse.isSuccess) {
      }

      else {
        this.showErrorMessage = true
      }
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
    return this.apiSrv.makeApi(`OnlineMaster`, 'Authenticate/Login', 'POST', params);
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
  private async successfullLogin(userData: any, token: string) {
    let currentDate = new Date()

    this.usrSrv.setUserToken(token)
    this.usrSrv.setUserData(userData)
    this.usrSrv.setLoginStatus(true)
    this.usrSrv.setAccountExpiry(currentDate)
    this.usrSrv.setUserBalance(await this.gnrcSrv.getBalance())
    this.hidePopup()
    this.usrSrv.gettUserId()
    this.router.navigate(['HPBPMU/courses-libanaises'])
  }

}
