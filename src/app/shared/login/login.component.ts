import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ageValidator } from 'src/app/ageValidator';
import { ApiService } from 'src/app/services/api.service';
import { CacheService } from 'src/app/services/cache.service';
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

  isLogin = true;

  isSignup: any;


  @Input() loginObject: any

  signupForm: FormGroup | any;

  forgotPasswordForm: FormGroup | any;

  resetPasswordForm: FormGroup | any;

  isAndroidApp = false

  showLoginPage = false

  userId: any;

  forgotPassword = false
  showPasswordReset: boolean = false;


  constructor(
    private router: Router,
    private storageSrv: LocalStorageService,
    private apiSrv: ApiService,
    private usrSrv: UserService,
    private gnrcSrv: GenericService,
    private fb: FormBuilder,
    private machineSrv: MachineService,
    private cacheSrv: CacheService
  ) {

  }
  errorMsg = ''
  showErrorMessage = false

  showOtpForm = false;

  showRequestOtp = false

  otpForm: any = this.fb.group({
    otp0: [''],
    otp1: [''],
    otp2: [''],
    otp3: [''],
    otp4: ['']
  });

  otpFields = Array(5).fill(0);

  loginForm = new FormGroup({
    Username: new FormControl('', [Validators.required]),
    Password: new FormControl('', [Validators.required])
  });



  ngOnInit(): void {

    this.isAndroidApp = this.gnrcSrv.isMachineApp()
    if (this.isAndroidApp) {
      this.autoLogin()
    }
    else {
      this.showLoginPage = true
    }

    // this.signupForm = this.fb.group({
    //   firstName: ['', Validators.required],
    //   lastName: ['', Validators.required],
    //   email: ['', [Validators.required, Validators.email]],
    //   phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // Simple phone validation
    //   dateOfBirth: ['', [Validators.required, ageValidator()]],
    //   username: ['', [Validators.required, Validators.minLength(3)]],
    //   password: ['', [Validators.required, Validators.minLength(6)]],
    //   confirmPassword: ['', Validators.required]
    // }, {
    //   validator: this.passwordMatchValidator // Custom validator for matching passwords
    // });

    this.signupForm = this.fb.group({
      username: ['', [Validators.required, this.emailOrPhoneValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator // Custom validator for matching passwords
    });


    this.forgotPasswordForm = this.fb.group({
      username: ['', [Validators.required, this.emailOrPhoneValidator]]
    });

    this.resetPasswordForm = this.fb.group({
      username: ['', [Validators.required, this.emailOrPhoneValidator]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      otp: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isSignup = (changes['loginObject'].currentValue.type == 'signup');
    this.isLogin = !this.isSignup
    ////console.log(changes['loginObject'].currentValue)
  }

  preventTyping(event: KeyboardEvent) {
    event.preventDefault(); // Prevents any typing input
  }

  emailOrPhoneValidator(control: any) {

    const value = control.value;

    if (!value) return null;

    // Email regex
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // UAE mobile regex
    const uaePhoneRegex =
      /^(?:\+971|971|0)?5[024568]\d{7}$/;

    if (emailRegex.test(value) || uaePhoneRegex.test(value)) {
      return null;
    }

    return { invalidUsername: true };
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
    this.isLogin = !value
    this.isSignup = value
    this.showErrorMessage = false
  }


  async autoLogin() {
    let userData = await this.cacheSrv.getFromFlutterOfflineCache('user_data')
    //console.log(userData)
    if (userData?.status == false || !userData) {
      this.showLoginPage = true
      return
    }
    this.loginForm.controls['Username'].setValue(userData?.UserName)
    this.loginForm.controls['Password'].setValue(userData?.UserPassword)
    //console.log(this.loginForm.value)
    this.submitLogin()
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
      console.log(respoonse)
      if (respoonse.status == false) {
        this.gnrcSrv.setModalData(true, false, respoonse.message)
      }
      else {
        this.router.navigate(['Machine/Home'])
      }
      ////console.log(respoonse)
    }

    else {
      try {
        const loginResponse = await this.login(loginParams)
        if (loginResponse.IsSuccess) {
          this.successfullLogin(loginResponse.UserInfo, loginResponse.UserInfo.Token)
        }
        else {
          this.errorMsg = loginResponse?.Message || 'Login failed. Please try again.'
          this.showErrorMessage = true

          if (loginResponse?.ReasonId == 4) {
            this.userId = loginResponse.UserId
            this.showOtpForm = true
            return
          }


        }
      } catch (error: any) {
        if (error.error.status != undefined && error.error.status == 401) {
          this.showErrorMessage = true
        }
      }
    }

  }

  async submitForgotPassword() {
    if (this.forgotPasswordForm.invalid) {
      this.showErrorMessage = true
      return
    }
    const value = this.forgotPasswordForm.value.username;
    this.resetPasswordForm.patchValue({ username: value });

    const isEmail = value.includes('@');
    const payload = {
      Username: value,
    };

    const params = {
      body: payload
    }

    try {
      const forgotPasswordResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'Authenticate/ResetPassword', 'POST', params);
      if (forgotPasswordResponse.IsSuccess) {
        this.forgotPassword = false
        this.showPasswordReset = true
        this.showErrorMessage = false
      } else {
        this.errorMsg = forgotPasswordResponse?.Message || 'Failed to send OTP. Please try again.'
        this.showErrorMessage = true
      }
    } catch (error: any) {
      this.errorMsg = error?.error?.Message || 'An error occurred. Please try again.'
      this.showErrorMessage = true
    }
  }

  async submitNewPassword() {
    if (this.resetPasswordForm.invalid) {
      this.showErrorMessage = true
      return
    }



    const params = {
      body: this.resetPasswordForm.value
    };
    console.log(params)
    try {
      const resetPasswordResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'Authenticate/ChangePassword', 'POST', params);
      if (resetPasswordResponse.IsSuccess) {
        this.showPasswordReset = false
        this.showErrorMessage = false
      } else {
        this.errorMsg = resetPasswordResponse?.Message || 'Failed to reset password. Please try again.'
        this.showErrorMessage = true
      }
    } catch (error: any) {
      this.errorMsg = error?.error?.Message || 'An error occurred. Please try again.'
      this.showErrorMessage = true
    }
  }


  async submitSignUp() {
    ////console.log(this.signupForm)
    if (this.signupForm.invalid) {
      this.showErrorMessage = true
      return
    }
    const value = this.signupForm.value.username;

    const isEmail = value.includes('@');

    const payload = {
      email: isEmail ? value : null,
      phone: !isEmail ? value : null,
      password: this.signupForm.value.password
    };

    // let signupParams = this.signupForm.value
    const params = {
      body: payload

    }

    try {
      this.showErrorMessage = false
      const signupResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'Authenticate/Register', 'POST', params);
      ////console.log(signupResponse)
      if (signupResponse.IsSuccess) {
        this.userId = signupResponse.UserId
        this.showOtpForm = true
      }

      else {
        if (signupResponse.ReasonId == 4) {
          this.errorMsg = 'User already exists. Please login or use forgot password to reset your password.'
        }
        else {
          this.errorMsg = signupResponse?.Message || 'Something went wrong. Please try again.'
        }

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

  onOtpInput(event: any, index: number) {

    const input = event.target;
    const value = input.value;

    // Allow only numbers
    if (!/^[0-9]?$/.test(value)) {
      input.value = '';
      return;
    }

    // Auto move forward
    if (value && index < 4) {
      const next = document.querySelectorAll('.otp-box')[index + 1] as HTMLInputElement;
      next?.focus();
    }

    this.updateOtpValue();
  }

  onOtpKeyDown(event: any, index: number) {

    if (event.key === 'Backspace' && !event.target.value && index > 0) {

      const prev = document.querySelectorAll('.otp-box')[index - 1] as HTMLInputElement;
      prev?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {

    event.preventDefault();

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedText = clipboardData.getData('text').trim();

    if (!pastedText) return;

    // Keep only digits and limit to 5 characters
    const digits = pastedText.replace(/\D/g, '').slice(0, 5);

    digits.split('').forEach((digit, index) => {

      const control = this.otpForm.get('otp' + index);

      if (control) {
        control.setValue(digit);
      }

    });

    this.updateOtpValue();
  }

  updateOtpValue() {

    const otp =
      this.otpFields
        .map((_, i) => this.otpForm.get('otp' + i)?.value || '')
        .join('');

    this.otpForm.patchValue({}, { emitEvent: false });

    this.otpForm['otp'] = otp;
  }

  async verifyOtp() {

    if (this.otpForm.invalid) return;

    const otpValue = Object.values(this.otpForm.value).join('');
    console.log('Entered OTP:', otpValue);

    let params = {
      body: {
        UserId: this.userId,
        OTP: otpValue
      }
    }

    let otpResponse = await this.apiSrv.makeApi(`OnlineMaster`, 'Authenticate/ConfirmOTP', 'POST', params);

    if (otpResponse.IsSuccess) {
      this.showOtpForm = false;
      this.isSignup = false;
      this.showLoginPage = false;
      this.successfullLogin(otpResponse.UserInfo, otpResponse.UserInfo.Token)
    }

    else {
      this.errorMsg = 'Invalid OTP entered. Please try again.'
      this.showErrorMessage = true
      this.showRequestOtp = true
    }
    // Call backend verification here
    // this.authService.verifyOtp(otpValue).subscribe(() => {

    // this.showOtpForm = false;
    // this.isSignup = false; // go back to login
    // this.showLoginPage = true;

    // });
  }

  async requestNewOtp() {
    const otpResponse = await this.apiSrv.makeApi(`OnlineMaster`, `Authenticate/RequestOtp?id=${this.userId}`, 'GET', {});
    if (otpResponse == true) {
      this.errorMsg = 'A new OTP has been sent to your registered email or phone.'
      this.showRequestOtp = false
    }
    else {
      this.errorMsg = 'Failed to send new OTP. Please try again later.'
    }
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

  }

}
