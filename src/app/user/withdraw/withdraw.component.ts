import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { GenericService } from 'src/app/services/generic.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrl: './withdraw.component.scss',
  standalone: false
})
export class WithdrawComponent {

  userBalance: any = 0;
  balanceSubsription: Subscription;
  transactionTypesResponse: any = [];
  withdrawAmount: number = 0;
  showError: boolean = false;
  currencies: any = [];
  currencyId: number = 0;
  alert: any = null
  showAlert: boolean = false

  constructor(
    private usrSrv: UserService,
    private gnrcSrv: GenericService
  ) {
    this.balanceSubsription = this.usrSrv.getUserBalance().subscribe((data) => {
      console.log(data)
    });
  }

  ngOnInit(): void {
    this.getAvailableWithdraw()
    this.getTransactionTypes()
    this.getCurrencies()
  }

  async getAvailableWithdraw() {
    let balanceResponse = await this.gnrcSrv.getBalance()
    console.log(balanceResponse)
    this.userBalance = balanceResponse
  }

  async getTransactionTypes() {
    this.transactionTypesResponse = await this.gnrcSrv.getTransactionTypes()
    console.log(this.transactionTypesResponse)
  }

  async getCurrencies() {
    this.currencies = await this.gnrcSrv.getCurrencies()
    this.currencyId = this.currencies[0].id
    console.log(this.currencies)
  }

  async submitWithdraw() {
    this.showError = false
    if (this.withdrawAmount <= 0 || this.withdrawAmount > this.userBalance.WinningAmount) {
      this.showError = true
      return
    }
    let params = {
      body: {
        "amount": this.withdrawAmount,
        "currencyId": this.currencyId,
        "transactionTypeId": this.transactionTypesResponse.find((x: any) => x.name == 'Withdraw').id
      }
    }
    console.log(params)
    let withdrawResponse = await this.gnrcSrv.updateBalance(params)
    this.showAlert = true
    if (!withdrawResponse.isSuccess) {
      this.showError = true
    }
    else {
      this.usrSrv.triggerNotification({
        type: 'success',
        message: 'Withdraw request has been submitted successfully'
      })

      this.getAvailableWithdraw()
      this.withdrawAmount = 0
    }
  }
}
