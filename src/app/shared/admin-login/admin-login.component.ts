import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-admin-login',
  standalone: false,
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnChanges {
  showErrorMessage: boolean = false;
  errorMsg: string = 'Incorrect Password';

  @Input() shouldShowAdminPage: any = true

  loginForm = new FormGroup({
    Username: new FormControl('', [Validators.required]),
    Password: new FormControl('', [Validators.required])
  });

  constructor(private machineSrv: MachineService) {
    this.machineSrv.getAdminPopupStatus().subscribe(status => {
      //console.log(status)
    });
  }

  toggleAdminLogin(isLoggedIn: boolean) {
    this.machineSrv.setAdminLoginStatus(isLoggedIn, this.shouldShowAdminPage);
  }

  toggleAdminPopup(show: boolean) {
    this.machineSrv.setAdminPopupStatus(show);
  }

  hidePopup() {
    this.toggleAdminPopup(false);
    setTimeout(() => {
      this.loginForm.reset();
      this.showErrorMessage = false;
    }, 100)
  }


  ngOnChanges(changes: SimpleChanges): void {
    //console.log('ngOnChanges triggered');
    // Only re-process if allEvents reference has changed (avoids redundant API calls)
    if (changes['shouldShowAdminPage'] && changes['shouldShowAdminPage'].currentValue !== changes['shouldShowAdminPage'].previousValue) {
      //console.log(this.shouldShowAdminPage)
    }
  }

  async submitLogin() {
    let loginParams = {
      username: this.loginForm.value.Username,
      password: this.loginForm.value.Password
    }
    let respoonse = await this.machineSrv.handleApiResponse('GameCooksAuth', 'LoginMachine', 'POST', loginParams)
    console.log(respoonse)

    if (respoonse.status == true) {
      this.toggleAdminLogin(true);
    }

    else {
      this.errorMsg = 'Invalid credentials.';
      this.showErrorMessage = true;
    }

  }
}
