import { DecimalPipe } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CartService } from 'src/app/services/cart.service';
import { GenericService } from 'src/app/services/generic.service';
import { LoaderService } from 'src/app/services/loader-service.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { MachineService } from 'src/app/services/machine.service';
import { UserService } from 'src/app/services/user.service';



@Component({
  selector: 'app-shared-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: false
})
export class CartComponent implements OnInit, OnDestroy, OnChanges {

  @Input() listOfBets: any = []
  @Input() selectedEvent: any = null

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

  stake = 200

  bonusRules: any = []

  BonusId = 0

  Math: any;



  betItem: any

  isDesktop: any = this.gnrcSrv.getIsDesktopView()

  isDesktopSubscription: Subscription

  canIssueTicket = false

  currentUrl: any = window.location.href;

  isSportsBetting = this.currentUrl.includes("Sports")

  isJackpotGame = this.currentUrl.includes("Jackpot")

  isPickXGame = this.currentUrl.includes("PickX")

  lotoTotalPrice: any = 0

  isAndroidApp = this.gnrcSrv.isMachineApp()

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

    if (this.isSportsBetting) {
      this.cartSubscription = this.cartSrv.getSBCartData().subscribe((data) => {
        this.cartInitialize(data)
      });
    }

    else {
      this.cartSubscription = this.cartSrv.getCartData().subscribe((data) => {
        this.cartInitialize(data)
      });
    }


    this.loginStatusSubscription = this.usrSrv.getLoginStatus().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }

  async ngOnInit() {
    this.isLoggedIn = await this.usrSrv.isUserLoggedIn();
    if (this.isAndroidApp) {
      this.canIssueTicket = await this.machineSrv.getMachinePermission('TerminalCanIssuTicket')
    }
    else {
      this.canIssueTicket = true
    }
    //console.log(this.canIssueTicket)

    let sbCartData = this.storageSrv.getItem('sbCartData')
    if (sbCartData) {
      this.cartInitialize(sbCartData)
    }
    else {
      this.loadLotoCartDataFromContext();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedEvent'] && !this.isSportsBetting) {
      this.loadLotoCartDataFromContext();
    }
  }

  private loadLotoCartDataFromContext() {
    const lotoCartData = this.cartSrv.getCurrentLotoCartData(this.selectedEvent);
    if (lotoCartData) {
      this.cartInitialize(lotoCartData)
    }
  }

  cartInitialize(cartData: any) {
    this.listOfBets = cartData
    this.showCartButtons = this.listOfBets?.length > 0;

    if (this.isSportsBetting) {
      this.totalBets = parseInt(this.storageSrv.getItem('totalBets'))
      this.totalOdds = this.storageSrv.getItem('TotaldOdds')
      this.stake = (cartData.length > 0) ? this.listOfBets[0].StakeFromSearch : 200
      this.calculateBonus()
    }

    if ((this.isPickXGame || this.isJackpotGame) && this.listOfBets.length > 0) {
      this.listOfBets.GameEventId = this.listOfBets[0].gameEventId
      this.listOfBets.TicketPrice = 0
      this.listOfBets.forEach((ticketItem: any) => {
        this.listOfBets.TicketPrice += ticketItem.stake
      })
    }
    console.log(this.listOfBets)
  }

  async calculateBonus() {

    ////console.log(this.stake)
    let minimumPicks = 0
    this.bonus = 0
    this.BonusId = 0
    let allowedCumulatedOdds = 1
    if (this.bonusRules.length == 0) {
      this.bonusRules = await this.cartSrv.getBonusRules()
      ////console.log(this.bonusRules)
    }

    if (this.listOfBets && this.listOfBets.length > 0) {
      this.listOfBets.filter((betItem: any) => betItem.HasMinimumOdd).forEach((oddItem: any) => {
        allowedCumulatedOdds *= oddItem.Odd
        ////console.log(allowedCumulatedOdds)
      });
      let selectedBonus = this.bonusRules.find((selectedBonus: any) => (selectedBonus.FromPickRequiered == this.listOfBets.filter((betItem: any) => betItem.HasMinimumOdd).length) && (selectedBonus.MinStackeRequiered <= this.stake))
      ////console.log(selectedBonus)
      if (selectedBonus) {
        this.BonusId = selectedBonus?.BonusRuleId
        ////console.log(this.listOfBets.length)
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
    ////console.log(this.WinAmount)
  }

  addBetToTicket(betItem: any) {
    ////console.log(betItem)
  }

  onAmountChange() {
    this.calculateBonus()
  }

  clearBets() {
    if (this.isSportsBetting) {
      this.storageSrv.removeItem('sbCartData')
      this.cartSrv.clearBets()
      return;
    }

    this.cartSrv.clearCurrentLotoBets(this.selectedEvent)
  }

  removeItemFormSlip(betItem: any) {
    this.cartSrv.removeBetItem(betItem)
  }

  removeLotoItemFormSlip(betItem: any, index: any) {
    this.cartSrv.removeLotoBetItem(betItem, index, this.selectedEvent)
  }

  OnclickIsMobile() {
    if (!this.isDesktop) {
      this.showOnClickMobile = !this.showOnClickMobile
    }
  }

  hideMenus() {
    this.showOnClickMobile = false
  }

  async issueTicket() {
    if (!this.isLoggedIn) {
      this.usrSrv.setLoginPopupStatus({
        show: true,
        type: 'login'
      })
      return
    }

    let apiResponse: any
    if (this.isSportsBetting) {
      this.listOfPicks = []
      this.listOfBets.forEach((betItem: any) => {
        this.listOfPicks.push({
          Outcome: betItem,
          Stake: this.stake / this.totalBets,
          GameEventId: betItem.MatchId
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
      apiResponse = await this.machineSrv.issueSBTicket(ticketBody)
    }
    else {
      apiResponse = await this.machineSrv.issueTicket(this.listOfBets, true)
    }

    if (this.isAndroidApp && apiResponse.DataToPrint) {
      this.clearBets()
      this.gnrcSrv.setModalData(true, true, apiResponse.message)
    }

    else {
      console.log(apiResponse)
      if (apiResponse.Status == true || apiResponse == true) {
        this.clearBets()
        this.usrSrv.setUserBalance(await this.gnrcSrv.getBalance())
        this.gnrcSrv.setModalData(true, true, apiResponse.message || 'Betslip Confirmed successfully.')
      }
    }


  }

  ngOnDestroy(): void {
    this.isDesktopSubscription.unsubscribe();
    this.cartSubscription.unsubscribe();
    this.loginStatusSubscription.unsubscribe();
  }
}
