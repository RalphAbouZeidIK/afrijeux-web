import { DecimalPipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CartService } from 'src/app/services/cart.service';
import { GenericService } from 'src/app/services/generic.service';
import { LoaderService } from 'src/app/services/loader-service.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { MachineService } from 'src/app/services/machine.service';
import { UserService } from 'src/app/services/user.service';



@Component({
  selector: 'app-sbcart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: false
})
export class CartComponent implements OnInit, OnDestroy {

  @Input() listOfBets: any = []

  cartSubscription: Subscription

  showCartButtons = false

  showContainer: any

  totalBets: any

  totalOdds: any

  bonus: any = 0

  listOfPicks: any = []

  WinAmount: any

  /**
   * Subscribe to login status
   */
  loginStatusSubscription: Subscription;

  /**
   * Flag to check if user is logged in
   */
  isLoggedIn: any = false

  showOnClickMobile = false

  stake = 0

  bonusRules: any = []

  BonusId = 0

  Math: any;

  isSportsBetting = false

  betItem: any

  isDesktop: any = this.gnrcSrv.getIsDesktopView()

  isDesktopSubscription: Subscription


  canIssueTicket = false

  //stakeSubscription: Subscription

  constructor(
    private cartSrv: CartService,
    private storageSrv: LocalStorageService,
    private usrSrv: UserService,
    private gnrcSrv: GenericService,
    private machineSrv: MachineService
  ) {

    this.isDesktopSubscription = this.gnrcSrv.getIsDesktopViewListener().subscribe((isDesktop) => {
      this.isDesktop = isDesktop;
    });

    this.cartSubscription = this.cartSrv.getSBCartData().subscribe((data) => {
      this.cartInitialize(data)
    });

    this.loginStatusSubscription = this.usrSrv.getLoginStatus().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }

  async ngOnInit() {

    this.isLoggedIn = await this.usrSrv.isUserLoggedIn();

    this.canIssueTicket = await this.machineSrv.getMachinePermission('TerminalCanIssuTicket')
    console.log(this.canIssueTicket)

    let sbCartData = this.storageSrv.getItem('sbCartData')
    if (sbCartData) {
      this.cartInitialize(sbCartData)
    }
  }

  cartInitialize(cartData: any) {
    this.listOfBets = cartData
    this.showCartButtons = this.listOfBets?.length > 0;
    this.totalBets = parseInt(this.storageSrv.getItem('totalBets'))
    this.totalOdds = this.storageSrv.getItem('TotaldOdds')
    this.stake = (cartData.length > 0) ? this.listOfBets[0].StakeFromSearch : 0
    this.calculateBonus()
  }

  async calculateBonus() {

    //console.log(this.stake)
    let minimumPicks = 0
    this.bonus = 0
    this.BonusId = 0
    let allowedCumulatedOdds = 1
    if (this.bonusRules.length == 0) {
      this.bonusRules = await this.cartSrv.getBonusRules()
      //console.log(this.bonusRules)
    }

    if (this.listOfBets && this.listOfBets.length > 0) {
      this.listOfBets.filter((betItem: any) => betItem.HasMinimumOdd).forEach((oddItem: any) => {
        allowedCumulatedOdds *= oddItem.Odd
        //console.log(allowedCumulatedOdds)
      });
      let selectedBonus = this.bonusRules.find((selectedBonus: any) => (selectedBonus.FromPickRequiered == this.listOfBets.filter((betItem: any) => betItem.HasMinimumOdd).length) && (selectedBonus.MinStackeRequiered <= this.stake))
      //console.log(selectedBonus)
      if (selectedBonus) {
        this.BonusId = selectedBonus?.BonusRuleId
        //console.log(this.listOfBets.length)
        let unitStake = this.stake / selectedBonus?.FromPickRequiered
        this.bonus = (selectedBonus?.Percentage / 100) * unitStake * this.listOfBets.filter((betItem: any) => betItem.HasMinimumOdd).length * allowedCumulatedOdds
        this.bonus = Math.round(this.bonus * 100) / 100;
      }
      else {
        this.bonus = 0
      }

    }
    this.WinAmount = this.totalOdds * this.stake + this.bonus
    this.WinAmount = Math.round(this.WinAmount * 100) / 100
    //console.log(this.WinAmount)
  }

  addBetToTicket(betItem: any) {
    //console.log(betItem)
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

    let date = new Date()
    this.listOfPicks = []
    this.listOfBets.forEach((betItem: any) => {
      this.listOfPicks.push({
        Outcome: betItem,
        Stake: this.stake / this.totalBets
      })
    });

    let ticketBody = {
      IsVoucher: 0,
      Stake: this.stake,
      GamePick: this.listOfPicks,
      TypeId: (this.listOfPicks.length > 1) ? 2 : 1,
      IsBouquet: false,
      BonusId: this.BonusId,
      WinAmount: this.WinAmount,
      BonusAmount: this.bonus,
      LoyalityReferenceId: 0
    }
    let apiResponse = await this.machineSrv.issueSBTicket(ticketBody)
    if (apiResponse.DataToPrint) {
      this.clearBets()
    }


  }

  ngOnDestroy(): void {
    this.isDesktopSubscription.unsubscribe();
    this.cartSubscription.unsubscribe();
    this.loginStatusSubscription.unsubscribe();
  }
}
