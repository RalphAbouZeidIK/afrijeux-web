import { DecimalPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CartService } from 'src/app/services/cart.service';
import { GenericService } from 'src/app/services/generic.service';
import { LoaderService } from 'src/app/services/loader-service.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { UserService } from 'src/app/services/user.service';



@Component({
  selector: 'app-sbcart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: false
})
export class CartComponent implements OnInit {

  @Input() listOfBets: any = []

  cartSubscription: Subscription

  showCartButtons = false

  showContainer: any

  totalBets: any

  totalOdds: any

  isDesktop = true

  bonus: any = 0

  listOfPicks: any = []

  winAmount: any

  /**
   * Subscribe to login status
   */
  loginStatusSubscription: Subscription;

  /**
   * Flag to check if user is logged in
   */
  isLoggedIn = false

  showOnClickMobile = false

  stake = 0

  gameid = 5

  PersonId = 8746

  MachineId = 2338

  bonusRules: any = []

  BonusId = 0

  Math: any;

  isSportsBetting = false

  betItem: any

  constructor(
    private cartSrv: CartService,
    private storageSrv: LocalStorageService,
    private usrSrv: UserService,
    private apiSrv: ApiService,
    private gnrcSrv: GenericService,
    private decimalPipe: DecimalPipe,
    private loaderService: LoaderService
  ) {


    this.cartSubscription = this.cartSrv.getSBCartData().subscribe((data) => {
      this.cartInitialize(data)
    });


    this.isLoggedIn = this.usrSrv.isUserLoggedIn();

    this.loginStatusSubscription = this.usrSrv.getLoginStatus().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }

  ngOnInit(): void {
    if (window.innerWidth < 1200) {
      this.isDesktop = false
    }

    this.cartInitialize(this.storageSrv.getItem('sbCartData'))


  }

  cartInitialize(cartData: any) {
    console.log(cartData)
    this.listOfBets = cartData
    this.showCartButtons = this.listOfBets?.length > 0;
    this.totalBets = parseInt(this.storageSrv.getItem('totalBets'))
    this.totalOdds = this.storageSrv.getItem('TotaldOdds')
    this.calculateBonus()
  }

  async calculateBonus() {
    console.log(this.stake)
    let minimumPicks = 0
    this.bonus = 0
    this.BonusId = 0
    let allowedCumulatedOdds = 1
    if (this.bonusRules.length == 0) {
      this.bonusRules = await this.cartSrv.getBonusRules()
    }

    if (this.listOfBets && this.listOfBets.length > 0) {
      this.listOfBets.filter((betItem: any) => betItem.hasMinimumOdd).forEach((oddItem: any) => {
        allowedCumulatedOdds *= oddItem.odd
      });
      let selectedBonus = this.bonusRules.find((selectedBonus: any) => (selectedBonus.fromPickRequiered == this.listOfBets.filter((betItem: any) => betItem.hasMinimumOdd).length) && (selectedBonus.minStackeRequiered <= this.stake))
      console.log(selectedBonus)
      if (selectedBonus) {
        this.BonusId = selectedBonus?.bonusRuleId
        let unitStake = this.stake / this.listOfBets.length
        this.bonus = (selectedBonus?.percentage / 100) * unitStake * this.listOfBets.filter((betItem: any) => betItem.hasMinimumOdd).length * allowedCumulatedOdds
        this.bonus = Math.round(this.bonus * 100) / 100;
      }
      else {
        this.bonus = 0
      }

    }
    this.winAmount = this.totalOdds * this.stake + this.bonus
    this.winAmount = Math.round(this.winAmount * 100) / 100
    console.log(this.winAmount)
  }

  addBetToTicket(betItem: any) {
    console.log(betItem)
  }

  onAmountChange() {
    this.calculateBonus()
  }

  clearBets() {
    this.storageSrv.removeItem('sbCartData')
    this.cartSrv.clearBets()
  }

  removeItemFormSlip(betItem: any) {
    this.cartSrv.removeBetItem(betItem)
  }

  OnclickIsMobile() {
    if (!this.isDesktop) {
      this.showOnClickMobile = !this.showOnClickMobile
    }

  }

  onResize(event: any) {
    if (event.target.innerWidth < 1200) {
      this.isDesktop = false
    }
    else {
      this.isDesktop = true
    }
  }

  hideMenus() {
    document.querySelector('.cart-container')?.classList.remove("show-cart");
  }

  async issueTicket() {
    if (!this.isLoggedIn) {
      this.usrSrv.setLoginPopupStatus({
        show: true,
        type: 'login'
      })
      return
    }
    
    this.loaderService.setHttpProgressStatus(true);
    setTimeout(async () => {
      let date = new Date()
      this.listOfPicks = []
      this.listOfBets.forEach((betItem: any) => {
        this.listOfPicks.push({
          Outcome: betItem,
          Stake: this.stake / this.totalBets
        })
      });

      let ticketBody = {
        GameId: this.gameid,
        IsVoucher: 0,
        Stake: this.stake,
        MachineDateIssued: date.toISOString(),
        GamePick: this.listOfPicks,
        TypeId: (this.listOfPicks.length > 1) ? 2 : 1,
        IsBouquet: false,
        BonusId: this.BonusId,
        WinAmount: this.winAmount,
        BonusAmount: this.bonus,
        LoyalityReferenceId: 0
      }

      let ticketRequestId = this.MachineId.toString() + this.MachineId.toString() + this.PersonId.toString() + this.gnrcSrv.getFormattedToday() + this.gameid
      ticketRequestId = ("00000000000000000000000000000000000" + ticketRequestId).substring(ticketRequestId.length);

      let params = {
        GameId: this.gameid,
        PersonId: this.PersonId,
        MachineId: this.MachineId,
        Ticket: ticketBody,
        TicketRequestId: ticketRequestId,
        LoyalityReferenceId: 0,
        TimeStamp: 'string',
      }
      console.log(params)
      this.loaderService.setHttpProgressStatus(false);
      try {
        const apiResponse = await this.apiSrv.makeApi('AfrijeuxSportsBetting', 'AfrijeuxSportsBetting/IssueTicket', 'POST', params)
        if (apiResponse.status) {
          this.clearBets()
        }
        console.log(apiResponse)
      } catch (error) {
        console.log(error)
      }
    }, 2000);
  }
}
