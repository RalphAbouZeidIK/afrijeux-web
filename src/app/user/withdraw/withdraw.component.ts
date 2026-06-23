import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { GenericService } from 'src/app/services/generic.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrl: './withdraw.component.scss',
  standalone: false
})
export class WithdrawComponent implements OnInit, OnDestroy {

  @Input() mode: 'deposit' | 'withdraw' = 'deposit';
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  userBalance: any;
  transactionTypesResponse: any = [];
  amount: any = null;
  currencies: any = [];
  currencyId: number = 0;
  showError: boolean = false;
  isLoading: boolean = false;

  readonly presetAmounts = [10, 25, 50, 100, 250, 500];

  private balanceSubscription: Subscription | undefined;

  constructor(
    private usrSrv: UserService,
    private gnrcSrv: GenericService
  ) { }

  ngOnInit(): void {
    this.balanceSubscription = this.usrSrv.getUserBalance().subscribe((data) => {
      this.userBalance = data;
    });
    this.getTransactionTypes();
    this.getCurrencies();
  }

  ngOnDestroy(): void {
    this.balanceSubscription?.unsubscribe();
  }

  get title(): string {
    return this.mode === 'deposit' ? 'Add Money' : 'Withdraw';
  }

  get description(): string {
    return this.mode === 'deposit'
      ? 'Choose an amount or enter a custom value to add to your wallet.'
      : 'Choose an amount or enter a custom value to withdraw from your wallet.';
  }

  get submitLabel(): string {
    return this.mode === 'deposit'
      ? (this.amount > 0 ? 'Add ' + this.amount.toFixed(2) : 'Add Money')
      : (this.amount > 0 ? 'Withdraw ' + this.amount.toFixed(2) : 'Withdraw');
  }

  get currencyCode(): string {
    return this.userBalance?.CurrencyCode || '';
  }

  selectPreset(value: number): void {
    this.amount = value;
    this.showError = false;
  }

  async getTransactionTypes() {
    this.transactionTypesResponse = await this.gnrcSrv.getTransactionTypes();
  }

  async getCurrencies() {
    this.currencies = await this.gnrcSrv.getCurrencies();
    if (this.currencies?.length) {
      this.currencyId = this.currencies[0].Id;
    }
  }

  close(): void {
    this.closed.emit();
  }

  async submit(): Promise<void> {
    this.showError = false;

    if (this.amount <= 0) {
      this.showError = true;
      return;
    }

    if (this.mode === 'withdraw' && this.userBalance?.WinningAmount != null && this.amount > this.userBalance.WinningAmount) {
      this.showError = true;
      return;
    }

    const typeName = this.mode === 'deposit' ? 'Deposit' : 'Withdraw';
    const transactionType = this.transactionTypesResponse.find((x: any) => x.Name === typeName);

    const params = {
      body: {
        amount: this.amount,
        currencyId: this.currencyId,
        transactionTypeId: transactionType?.Id
      }
    };

    this.isLoading = true;
    try {
      const response = await this.gnrcSrv.updateBalance(params);
      if (response?.IsSuccess) {
        const updatedBalance = await this.gnrcSrv.getBalance();
        this.usrSrv.setUserBalance(updatedBalance);
        this.usrSrv.triggerNotification({
          type: 'success',
          message: this.mode === 'deposit'
            ? 'Deposit submitted successfully'
            : 'Withdraw request has been submitted successfully'
        });
        this.submitted.emit();
        this.close();
      } else {
        this.showError = true;
      }
    } finally {
      this.isLoading = false;
    }
  }
}
