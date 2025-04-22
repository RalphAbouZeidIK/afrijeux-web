import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
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

  fieldChoice: any

  /**
   * Subscribe to login status
   */
  loginStatusSubscription: Subscription;

  /**
   * Flag to check if user is logged in
   */
  isLoggedIn = false

  showOnClickMobile = false

  isAllOrder = false


  betItem: any = []
  combinations = 0;
  pickDetailsArray: any = [];
  isParoli = false
  isDouble = false

  constructor(
    private cartSrv: CartService,
    private storageSrv: LocalStorageService,
    private usrSrv: UserService,
    private gnrcSrv: GenericService,
    private gamesService: GamesService,
    private translate:TranslateService
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
    this.isLoggedIn = this.usrSrv.isUserLoggedIn();
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
    if (data.typeChanged) {
      this.betItem = []
    }

    if (data.selectedFixedConfig?.isParoli) {
      this.isParoli = true
      this.isDouble = false
      if (this.betItem && this.betItem.length > 0 && !data.typeChanged) {
        let raceIndex = this.betItem.findIndex((item: any) => item.gameEventId == data.gameEventId)
        if (raceIndex != -1) {
          data.baseHorses.length === 0 ? this.betItem.splice(raceIndex, 1) : this.betItem[raceIndex] = data;
        }
        else {
          this.betItem.push(data)
        }
      }
      else {
        this.betItem = [data]
      }
    }

    else if (data.selectedFixedConfig?.isForTicketTypeEvent == 1) {
      this.isParoli = false
      this.isDouble = true
      let raceIndex = this.betItem.findIndex((item: any) => item.gameEventId == data.gameEventId)
      if (data.isDoubleMain) {
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
          this.betItem = this.betItem.filter((eventItems: any) => eventItems.isDoubleMain == true)
          this.betItem.push(data)
          this.cartSrv.setResetOtherEvents(data)
        }
      }
      console.log(this.betItem)
    }

    else {
      this.isParoli = false
      this.isDouble = false
      if (data.selectedFixedConfig.isAllOrder == 0) {
        this.isAllOrder = false
      }
      this.betItem = [data]

    }
    this.calculateCombinations(this.betItem)
    this.showCartButtons = this.listOfBets.length > 0
  }

  calculateCombinations(betItem: any) {
    let firstLength = 0
    let secondLength = 0

    if (this.isParoli) {
      (betItem[0]?.selectedFixedConfig.horsesNumberTelpo == 1) ? this.combinations = 1 : this.combinations = this.gnrcSrv.calculateCombinations(betItem.length, secondLength, betItem[0]?.selectedFixedConfig?.horsesNumberTelpo, this.isAllOrder)
      return
    }

    if (this.isDouble) {
      console.log(betItem)
      console.log(betItem.find((eventItems: any) => eventItems.isDoubleMain == false)?.baseHorses)
      if (betItem.find((eventItems: any) => eventItems.isDoubleMain == false)?.baseHorses) {
        this.combinations = betItem.find((eventItems: any) => eventItems.isDoubleMain == false)?.baseHorses?.length
      }
      else {
        this.combinations = 0
      }
      return
    }


    let betItemVar = this.betItem[0]
    switch (betItemVar.fieldChoice) {
      case 2:
        firstLength = betItemVar.associatedHorses.length
        secondLength = betItemVar.baseHorses.filter((item: any) => item.isDummy != true).length
        break;

      case 3:
        secondLength = betItemVar.baseHorses.filter((item: any) => item.isDummy != true).length
        firstLength = betItemVar.horseList.length - secondLength
        break;

      default:
        firstLength = betItemVar.baseHorses.length
        secondLength = 0

        break;
    }
    this.combinations = this.gnrcSrv.calculateCombinations(firstLength, secondLength, betItem[0]?.selectedFixedConfig?.horsesNumberTelpo, this.isAllOrder)


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


    if (this.isDouble) {
      let mainEvent = betItem.find((pickItem: any) => pickItem.isDoubleMain == true)
      let secondaryEvent = betItem.find((pickItem: any) => pickItem.isDoubleMain == false)

      if (mainEvent && secondaryEvent) {

        secondaryEvent.baseHorses.forEach((horseItem: any) => {

          let horsesArray: any = new Array(secondaryEvent.selectedFixedConfig.horsesNumberTelpo).fill("00");
          horsesArray = horsesArray.join(",");
          BaseHorses = horsesArray
          AssociatedHorses = mainEvent.baseHorses[0].horseName

          mainEvent = {
            ...mainEvent,
            AssociatedHorses: AssociatedHorses,
            BaseHorses: AssociatedHorses,
            BaseHorsesDisplay: AssociatedHorses,
            FormuleType: null
          }
          this.composePickDetails(mainEvent)


          AssociatedHorses = horseItem.horseName

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
            TicketTypeId: betItem[0].selectedFixedConfig.ticketTypeId,
            FormuleId: (this.isAllOrder) ? 2 : 1,
            PickDetails: this.pickDetailsArray,
            TicketPrice: betItem[0].price,
            Stake: betItem[0].price,
            id: Date.now()
          }

          this.composePickObject(PickObject, betItem)
        });
      }

      else {
        this.translate.get('alerts.minimum_horses_required', { count: betItem[0].selectedFixedConfig.horsesNumberTelpo })
          .subscribe((translatedMsg: string) => {
            alert(translatedMsg);
          });
        return
      }

    }

    else {

      if (this.isParoli) {
        if (betItem.length < betItem[0].selectedFixedConfig.horsesNumberTelpo) {
          this.translate.get('alerts.minimum_horses_required', { count: betItem[0].selectedFixedConfig.horsesNumberTelpo })
            .subscribe((translatedMsg: string) => {
              alert(translatedMsg);
            });
          return
        }

        betItem.forEach((paroliBetItem: any) => {
          AssociatedHorses = paroliBetItem.baseHorses.map((horse: any) => horse.horseName).join(',')
          let horsesArray: any = new Array(paroliBetItem.selectedFixedConfig.horsesNumberTelpo).fill("00");

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
        switch (betItem[0].fieldChoice) {
          case 2:
            if (betItem[0].baseHorses.filter((item: any) => item.isDummy != true).length + betItem[0].associatedHorses.length < betItem[0].selectedFixedConfig.horsesNumberTelpo) {
              this.translate.get('alerts.minimum_horses_required', { count: betItem[0].selectedFixedConfig.horsesNumberTelpo })
                .subscribe((translatedMsg: string) => {
                  alert(translatedMsg);
                });
              return
            }
            break;

          default:
            if (betItem[0].baseHorses.length < betItem[0].selectedFixedConfig.horsesNumberTelpo) {
              this.translate.get('alerts.minimum_horses_required', { count: betItem[0].selectedFixedConfig.horsesNumberTelpo })
                .subscribe((translatedMsg: string) => {
                  alert(translatedMsg);
                });
              return
            }

            break;
        }


        switch (betItem[0].fieldChoice) {
          case 1:
            AssociatedHorses = betItem[0].baseHorses.map((horse: any) => horse.horseName).join(',')
            let updatedHorses = betItem[0].baseHorses.map((horse: any) => ({
              ...horse,
              horseName: '0'
            }));
            BaseHorses = updatedHorses.map((horse: any) => horse.horseName).join(',')
            break
          case 2:
            BaseHorses = betItem[0].baseHorses.map((horse: any) => horse.horseName).join(',')
            AssociatedHorses = betItem[0].associatedHorses.map((horse: any) => horse.horseName).join(',')
            break;
          case 3:
            BaseHorses = betItem[0].baseHorses.map((horse: any) => horse.horseName).join(',')
            AssociatedHorses = betItem[0].horseList.filter((horse: any) => !horse.isBase).map((horse: any) => horse.horseName).join(',')
            break;

          default:
            break;
        }

        let BaseHorsesDisplay = betItem[0].baseHorses.map((horse: any) => (horse.isDummy) ? horse.horseNameDisplay : horse.horseName).join(',')


        betItem[0] = {
          ...betItem[0],
          AssociatedHorses: AssociatedHorses,
          BaseHorses: BaseHorses,
          BaseHorsesDisplay: BaseHorsesDisplay,
          FormuleType: betItem[0].selectedFormule?.name || null,
          showAssociatedHorses: (betItem[0].selectedFormule.id == 2) ? true : false
        }
        this.composePickDetails(betItem[0])
      }

      let PickObject = {
        NumberOfCombinations: this.combinations,
        Multiplier: 1,
        TicketTypeId: betItem[0].selectedFixedConfig.ticketTypeId,
        FormuleId: (this.isAllOrder) ? 2 : 1,
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
      FormuleId: (this.isAllOrder) ? 2 : 1,
      gameEventId: event.gameEventId,
      name: event.name,
      SinglePrice: event.price,
      BetType: event.selectedFixedConfig.details,
      FormuleType: event.FormuleType,
      showAssociatedHorses: event.showAssociatedHorses || false
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

    this.isAllOrder = false
    console.log(this.listOfBets)
    this.storageSrv.setItem('cartData', this.listOfBets)
    this.showCartButtons = this.listOfBets.length > 0
    this.cartSrv.setPmuBets(betItem, true)
  }

  async issueTicket() {
    if (!this.isLoggedIn) {
      this.usrSrv.setLoginPopupStatus({
        show: true,
        type: 'login'
      })
      return
    }

    const apiResponse = await this.gamesService.issueTicket(this.listOfBets)
    console.log(apiResponse)
    if (apiResponse.status) {
      this.clearBets()
    }
  }



}
