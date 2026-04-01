import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GenericService } from 'src/app/services/generic.service';
import { UserService } from 'src/app/services/user.service';

interface Transaction {
  Id: number;
  TransactionType: 'Deposit' | 'Withdraw';
  TransactionStatus: string;
  Amount: number;
  Currency: string;
  DateCreated: string;
}

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  userBalance: any;
  totalDeposited: number = 0;
  totalWithdrawn: number = 0;

  showModal = false;
  modalMode: 'deposit' | 'withdraw' = 'deposit';

  private balanceSubscription: Subscription | undefined;

  userName: string = '';

  constructor(private gnrcSrv: GenericService, private usrSrv: UserService) { }

  ngOnInit(): void {
    let userData = this.usrSrv.getUserData()
    console.log(userData)
    this.userName = userData?.Email || userData?.Phone || '';
    this.balanceSubscription = this.usrSrv.getUserBalance().subscribe((data) => {
      this.userBalance = data;
    });
    this.getTransactions();
  }

  ngOnDestroy(): void {
    this.balanceSubscription?.unsubscribe();
  }

  async getTransactions() {
    try {
      const apiResponse = await this.gnrcSrv.getTransactions()
      if (apiResponse) {
        this.transactions = apiResponse;
        this.calculateTotals();
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }

  calculateTotals() {
    this.totalDeposited = this.transactions
      .filter(t => t.TransactionType === 'Deposit')
      .reduce((sum, t) => sum + t.Amount, 0);

    this.totalWithdrawn = this.transactions
      .filter(t => t.TransactionType === 'Withdraw' && t.TransactionStatus.toLowerCase() === 'confirmed')
      .reduce((sum, t) => sum + t.Amount, 0);
  }

  getTransactionIconClass(transactionType: string): string {
    return transactionType === 'Deposit' ? 'transaction__icon--deposit' : 'transaction__icon--withdrawal';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase() === 'confirmed' ? 'transaction__status--completed' : `transaction__status--${status.toLowerCase()}`;
  }

  getAmountClass(transactionType: string): string {
    return transactionType === 'Deposit' ? 'transaction__amount--positive' : 'transaction__amount--negative';
  }

  openModal(mode: 'deposit' | 'withdraw'): void {
    this.modalMode = mode;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onTransactionSubmitted(): void {
    this.showModal = false;
    this.getTransactions();
  }
}
