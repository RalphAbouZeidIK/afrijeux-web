import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { GenericService } from 'src/app/services/generic.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { MachineService } from 'src/app/services/machine.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-pmucart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: false
})
export class CartComponent implements OnInit {

  listOfBets: any = []

  cartSubscription: Subscription

  showCartButtons = false

  showContainer: any

  totalMultiplicator: any

  totalBets: any

  isDesktop = true

  FieldChoice: any

  isAndroidApp = false

  /**
   * Subscribe to login status
   */
  loginStatusSubscription: Subscription;

  /**
   * Flag to check if user is logged in
   */
  isLoggedIn = false

  showOnClickMobile = false

  IsAllOrder = false


  betItem: any = []
  combinations = 0;
  pickDetailsArray: any = [];
  IsParoli = false
  IsDouble = false

  constructor(
    private cartSrv: CartService,
    private storageSrv: LocalStorageService,
    private usrSrv: UserService,
    private gnrcSrv: GenericService,
    private machineSrv: MachineService,
    private translate: TranslateService
  ) {

    this.cartSubscription = this.cartSrv.getCartData().subscribe((data) => {
      this.onCartEventChange(data)
      // this.totalMultiplicator = parseInt(this.storageSrv.getItem('totalMultiplicator'))
      // this.totalBets = parseInt(this.storageSrv.getItem('totalBets'))
    });

    this.isLoggedIn = this.usrSrv.isUserLoggedIn();

    this.loginStatusSubscription = this.usrSrv.getLoginStatus().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }

  ngOnInit(): void {
    this.isAndroidApp = this.gnrcSrv.isMachineApp()
    if (!this.isAndroidApp) {
      this.isLoggedIn = this.usrSrv.isUserLoggedIn();
    }
    if (window.innerWidth < 1200) {
      this.isDesktop = false
    }
    if (this.storageSrv.getItem('cartData') && this.storageSrv.getItem('cartData').length > 0) {
      this.listOfBets = this.storageSrv.getItem('cartData')
      this.calculateTicketPrice()
      this.showCartButtons = true
    }


    // this.totalMultiplicator = parseInt(this.storageSrv.getItem('totalMultiplicator'))
    // this.totalBets = parseInt(this.storageSrv.getItem('totalBets'))
  }

  clearBets() {
    this.listOfBets = []
    this.showCartButtons = false
    this.storageSrv.setItem('cartData', this.listOfBets)
  }

  removeItemFormSlip(betItem: any) {
    console.log('removing')
    this.listOfBets = this.listOfBets.filter((item: any) => item.id !== betItem.id)
    if (this.listOfBets.length > 0) {
      this.calculateTicketPrice()
    }
    else {
      this.showCartButtons = false
    }

    this.storageSrv.setItem('cartData', this.listOfBets)
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

  onPriceChange(event: any) {
    console.log(event)
  }

  orderTypeChange(event: any) {
    this.calculateCombinations(this.betItem)
  }

  onCartEventChange(data: any) {
    console.log(data)
    if (data.TypeChanged) {
      this.betItem = []
    }

    if (data.SelectedFixedConfig?.IsParoli) {
      this.IsParoli = true
      this.IsDouble = false
      if (this.betItem && this.betItem.length > 0 && !data.TypeChanged) {
        let raceIndex = this.betItem.findIndex((item: any) => item.GameEventId == data.GameEventId)
        if (raceIndex != -1) {
          data.BaseHorses.length === 0 ? this.betItem.splice(raceIndex, 1) : this.betItem[raceIndex] = data;
        }
        else {
          this.betItem.push(data)
        }
      }
      else {
        this.betItem = [data]
      }
    }

    else if (data.SelectedFixedConfig?.IsForTicketTypeEvent == 1) {
      this.IsParoli = false
      this.IsDouble = true
      let raceIndex = this.betItem.findIndex((item: any) => item.GameEventId == data.GameEventId)
      if (data.IsDoubleMain) {
        if (raceIndex != -1) {
          this.betItem[raceIndex] = data
        }
        else {
          this.betItem.push(data)
        }
      }
      else {
        if (raceIndex != -1) {
          this.betItem[raceIndex] = data
        }
        else {
          this.betItem = this.betItem.filter((eventItems: any) => eventItems.IsDoubleMain == true)
          this.betItem.push(data)
          this.cartSrv.setResetOtherEvents(data)
        }
      }
      console.log(this.betItem)
    }

    else {
      this.IsParoli = false
      this.IsDouble = false
      if (data.SelectedFixedConfig.IsAllOrder == 0) {
        this.IsAllOrder = false
      }
      this.betItem = [data]

    }
    this.calculateCombinations(this.betItem)
    this.showCartButtons = this.listOfBets.length > 0
  }

  calculateCombinations(betItem: any) {
    let firstLength = 0
    let secondLength = 0

    if (this.IsParoli) {
      (betItem[0]?.SelectedFixedConfig.HorsesNumberTelpo == 1) ? this.combinations = 1 : this.combinations = this.gnrcSrv.calculateCombinations(betItem.length, secondLength, betItem[0]?.SelectedFixedConfig?.HorsesNumberTelpo, this.IsAllOrder)
      return
    }

    if (this.IsDouble) {
      console.log(betItem)
      console.log(betItem.find((eventItems: any) => eventItems.IsDoubleMain == false)?.BaseHorses)
      if (betItem.find((eventItems: any) => eventItems.IsDoubleMain == false)?.BaseHorses) {
        this.combinations = betItem.find((eventItems: any) => eventItems.IsDoubleMain == false)?.BaseHorses?.length
      }
      else {
        this.combinations = 0
      }
      return
    }


    let betItemVar = this.betItem[0]
    console.log(betItemVar)
    switch (betItemVar.FieldChoice) {
      case 2:
        firstLength = betItemVar.AssociatedHorses.length
        secondLength = betItemVar.BaseHorses.filter((item: any) => item.IsDummy != true).length
        break;

      case 3:
        secondLength = betItemVar.BaseHorses.filter((item: any) => item.IsDummy != true).length
        firstLength = betItemVar.HorseList.filter((item: any) => !item.IsNoPartant).length - secondLength
        break;

      default:
        firstLength = betItemVar.BaseHorses.length
        secondLength = 0

        break;
    }
    this.combinations = this.gnrcSrv.calculateCombinations(firstLength, secondLength, betItem[0]?.SelectedFixedConfig?.HorsesNumberTelpo, this.IsAllOrder)


    console.log(this.combinations)
  }

  calculateTicketPrice() {
    this.listOfBets.TicketPrice = 0
    this.listOfBets.forEach((ticketItem: any) => {
      this.listOfBets.TicketPrice += ticketItem.TicketPrice
    })
  }


  addBetToTicket(betItem: any) {
    let AssociatedHorses = ''
    let BaseHorses = ''


    if (this.IsDouble) {
      let mainEvent = betItem.find((pickItem: any) => pickItem.IsDoubleMain == true)
      let secondaryEvent = betItem.find((pickItem: any) => pickItem.IsDoubleMain == false)

      if (mainEvent && secondaryEvent) {

        secondaryEvent.BaseHorses.forEach((horseItem: any) => {

          let horsesArray: any = new Array(secondaryEvent.SelectedFixedConfig.HorsesNumberTelpo).fill("00");
          horsesArray = horsesArray.join(",");
          BaseHorses = horsesArray
          AssociatedHorses = mainEvent.BaseHorses[0].HorseName

          mainEvent = {
            ...mainEvent,
            AssociatedHorses: AssociatedHorses,
            BaseHorses: AssociatedHorses,
            BaseHorsesDisplay: AssociatedHorses,
            FormuleType: null
          }
          this.composePickDetails(mainEvent)


          AssociatedHorses = horseItem.HorseName

          secondaryEvent = {
            ...secondaryEvent,
            AssociatedHorses: AssociatedHorses,
            BaseHorses: BaseHorses,
            BaseHorsesDisplay: AssociatedHorses,
            FormuleType: null
          }
          this.composePickDetails(secondaryEvent)

          let PickObject = {
            NumberOfCombinations: 2,
            Multiplier: 1,
            TicketTypeId: betItem[0].SelectedFixedConfig.TicketTypeId,
            FormuleId: (this.IsAllOrder) ? 2 : 1,
            PickDetails: this.pickDetailsArray,
            TicketPrice: betItem[0].price,
            Stake: betItem[0].price,
            id: Date.now()
          }

          this.composePickObject(PickObject, betItem)
        });
      }

      else {
        this.translate.get('alerts.minimum_horses_required', { count: betItem[0].SelectedFixedConfig.HorsesNumberTelpo })
          .subscribe((translatedMsg: string) => {
            alert(translatedMsg);
          });
        return
      }

    }

    else {

      if (this.IsParoli) {
        if (betItem.length < betItem[0].SelectedFixedConfig.HorsesNumberTelpo) {
          this.translate.get('alerts.minimum_horses_required', { count: betItem[0].SelectedFixedConfig.HorsesNumberTelpo })
            .subscribe((translatedMsg: string) => {
              alert(translatedMsg);
            });
          return
        }

        betItem.forEach((paroliBetItem: any) => {
          AssociatedHorses = paroliBetItem.BaseHorses.map((horse: any) => horse.HorseName).join(',')
          let horsesArray: any = new Array(paroliBetItem.SelectedFixedConfig.HorsesNumberTelpo).fill("00");

          horsesArray = horsesArray.join(",");
          BaseHorses = horsesArray

          let BaseHorsesDisplay = AssociatedHorses

          paroliBetItem = {
            ...paroliBetItem,
            AssociatedHorses: AssociatedHorses,
            BaseHorses: BaseHorses,
            BaseHorsesDisplay: BaseHorsesDisplay,
            FormuleType: null
          }
          this.composePickDetails(paroliBetItem)
        });

      }



      else {
        switch (betItem[0].FieldChoice) {
          case 2:
            if (betItem[0].BaseHorses.filter((item: any) => item.IsDummy != true).length + betItem[0].AssociatedHorses.length < betItem[0].SelectedFixedConfig.HorsesNumberTelpo) {
              this.translate.get('alerts.minimum_horses_required', { count: betItem[0].SelectedFixedConfig.HorsesNumberTelpo })
                .subscribe((translatedMsg: string) => {
                  alert(translatedMsg);
                });
              return
            }
            break;

          default:
            if (betItem[0].BaseHorses.length < betItem[0].SelectedFixedConfig.HorsesNumberTelpo) {
              this.translate.get('alerts.minimum_horses_required', { count: betItem[0].SelectedFixedConfig.HorsesNumberTelpo })
                .subscribe((translatedMsg: string) => {
                  alert(translatedMsg);
                });
              return
            }

            break;
        }


        switch (betItem[0].FieldChoice) {
          case 1:
            AssociatedHorses = betItem[0].BaseHorses.map((horse: any) => horse.HorseName).join(',')
            let updatedHorses = betItem[0].BaseHorses.map((horse: any) => ({
              ...horse,
              HorseName: '0'
            }));
            BaseHorses = updatedHorses.map((horse: any) => horse.HorseName).join(',')
            break
          case 2:
            BaseHorses = betItem[0].BaseHorses.map((horse: any) => horse.HorseName).join(',')
            AssociatedHorses = betItem[0].AssociatedHorses.map((horse: any) => horse.HorseName).join(',')
            break;
          case 3:
            BaseHorses = betItem[0].BaseHorses.map((horse: any) => horse.HorseName).join(',')
            AssociatedHorses = betItem[0].HorseList.filter((horse: any) => !horse.IsBase && !horse.IsNoPartant).map((horse: any) => horse.HorseName).join(',')
            break;

          default:
            break;
        }

        let BaseHorsesDisplay = betItem[0].BaseHorses.map((horse: any) => (horse.IsDummy) ? horse.HorseNameDisplay : horse.HorseName).join(',')


        betItem[0] = {
          ...betItem[0],
          AssociatedHorses: AssociatedHorses,
          BaseHorses: BaseHorses,
          BaseHorsesDisplay: BaseHorsesDisplay,
          FormuleType: betItem[0].SelectedFormule?.name || null,
          showAssociatedHorses: (betItem[0].SelectedFormule.id == 2) ? true : false
        }
        this.composePickDetails(betItem[0])
      }

      let PickObject = {
        NumberOfCombinations: this.combinations,
        Multiplier: 1,
        TicketTypeId: betItem[0].SelectedFixedConfig.TicketTypeId,
        FormuleId: (this.IsAllOrder) ? 2 : 1,
        PickDetails: this.pickDetailsArray,
        TicketPrice: betItem[0].price * this.combinations,
        Stake: betItem[0].price * this.combinations,
        id: Date.now()
      }

      this.composePickObject(PickObject, betItem)
    }
  }

  composePickDetails(event: any) {
    console.log(event)
    let PickDetails = {
      AssociatedHorses: event.AssociatedHorses,
      BaseHorses: event.BaseHorses,
      BaseHorsesDisplay: event.BaseHorsesDisplay,
      FormuleId: (this.IsAllOrder) ? 2 : 1,
      gameEventId: event.GameEventId,
      name: event.name,
      SinglePrice: event.price,
      BetType: event.SelectedFixedConfig.details,
      FormuleType: event.FormuleType,
      showAssociatedHorses: event.ShowAssociatedHorses || false
    }

    this.pickDetailsArray.push(PickDetails)
  }

  composePickObject(pickObject: any, betItem: any) {
    console.log(pickObject)
    this.listOfBets.TicketPrice = 0
    this.listOfBets.push(pickObject)
    this.calculateTicketPrice()

    this.betItem = []
    this.pickDetailsArray = []

    this.IsAllOrder = false
    console.log(this.listOfBets)
    this.storageSrv.setItem('cartData', this.listOfBets)
    this.showCartButtons = this.listOfBets.length > 0
    this.cartSrv.setPmuBets(betItem, true)
  }

  async issueTicket() {
    if (!this.isAndroidApp && !this.isLoggedIn) {
      this.usrSrv.setLoginPopupStatus({
        show: true,
        type: 'login'
      })
      return
    }

    const apiResponse = await this.machineSrv.issueTicket(this.listOfBets)
    console.log(apiResponse)
    if (apiResponse.DataToPrint) {
      this.clearBets()
    }
  }



}
