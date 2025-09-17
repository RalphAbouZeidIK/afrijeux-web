import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { race, Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';
import { MachineService } from 'src/app/services/machine.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
  standalone: false
})
export class CoursesComponent implements OnInit, AfterViewInit {

  dataArray: any = [];

  selectedRace: any

  isFullPage = false

  typesStructure: any = [
    {
      name: "Trot Attelé",
      countries: [
        {
          'name': 'france',
        },
        { 'name': 'italy', }
      ]
    },
    {
      name: "Obstacle",
      countries: [
        {
          'name': 'france',
        },
        { 'name': 'italy', }
      ]
    }, {
      name: "Trot Monté",
      countries: [
        {
          'name': 'france',
        },
        { 'name': 'italy', }
      ]
    }
  ]

  cartSubscription: Subscription

  resetEventsSubs: Subscription

  today = new Date()

  date = new Date()

  countryCode = 'Bey'

  isAndroidApp = false

  constructor(
    private router: Router,
    private gamesSrv: GamesService,
    private cartSrv: CartService,
    private gnrcSrv: GenericService,
    private machineSrv: MachineService,
  ) {
    this.cartSubscription = this.cartSrv.getEventFromCart().subscribe((data) => {
      this.getGameEvents()
    });

    this.resetEventsSubs = this.cartSrv.getResetOtherEvents().subscribe((data) => {
      this.resetOnEventChange(data)

    });
  }

  ngOnInit(): void {

    this.isAndroidApp = this.gnrcSrv.isMachineApp()

    const currentUrl = this.router.url;
    if (currentUrl.includes('courses-francaises') || currentUrl.includes('courses-libanaises')) {
      this.isFullPage = true
    }
    if (currentUrl.includes('courses-francaises')) {
      this.countryCode = 'Fr'
    }
    this.getGameEvents()
  };


  ngAfterViewInit() {
    if (window.innerWidth < 767 && !this.isFullPage) {
      // setTimeout(() => {
      //   this.clickFirstLevelItem()
      // }, 500);
    }
  }

  async getRaceById(reunionId: any, raceId: any) {

  }

  /**
   * Expand Collapse function
   */

  toggleSub(item: any) {
    item.isExpanded = !item.isExpanded
  }

  async getGameEvents() {
    let gameEventsResponse: any

    if (this.isAndroidApp) {
      gameEventsResponse = await this.machineSrv.getGameEvents()
      this.dataArray = gameEventsResponse.GameConfiguration.EventConfiguration
      if (this.dataArray) {
        this.dataArray.forEach((raceItem: any) => {
          this.getEventConfig(raceItem)
        });

      }
    }
    else {
      gameEventsResponse = await this.gamesSrv.getGameEvents(this.date, this.countryCode)
      this.dataArray = gameEventsResponse.eventConfiguration
      if (this.dataArray) {
        this.dataArray.forEach((reunionItem: any) => {
          reunionItem.events.forEach((raceItem: any) => {
            this.getEventConfig(raceItem)
          });
        });

      }
    }

    console.log(gameEventsResponse)
    console.log(this.dataArray)




    console.log(this.dataArray)
  }

  onDateChange(event: any) {
    this.date = event
    this.getGameEvents()
  }

  async getEventConfig(raceItem: any) {
    raceItem.fixedConfigs.forEach((fixedConfigItem: any) => {
      fixedConfigItem.isSelected = false
      fixedConfigItem.isParoli = false

      if (fixedConfigItem.isCumulative && fixedConfigItem.isMultiEvent) {
        fixedConfigItem.isParoli = true
      }
    });

    raceItem.baseHorses = []
    raceItem.associatedHorses = []

    raceItem.horseList.forEach((horseItem: any) => {
      (horseItem.startingStatus == 1) ? horseItem.isNoPartant = false : horseItem.isNoPartant = true
      horseItem.isExpanded = false,
        horseItem.isDisabled = true
      horseItem.horseName = horseItem.horseName.padStart(2, '0');
    });

    raceItem.isExpanded = false
    console.log(raceItem)
  }

  resetOnEventChange(data: any) {
    console.log(data)
    if (data.selectedFixedConfig.isForTicketTypeEvent == 1) {
      let sameReunion = this.dataArray.find((item: any) => item.reunionCode == data.reunionCode)
      if (sameReunion) {
        sameReunion.events.forEach((eventItem: any) => {
          if (!eventItem.isDoubleMain && (eventItem.gameEventId != data.gameEventId)) {
            eventItem.baseHorses = []
            eventItem.associatedHorses = []
            eventItem.horseList.forEach((horseItem: any) => {
              horseItem.isSelected = false
            });
          }
        });
      }

    }
  }


  eventBetSet(event: any) {
    console.log(event)
    this.dataArray.forEach((reunionItem: any) => {
      reunionItem.events.forEach((raceItem: any) => {
        if ((raceItem.gameEventId != event.gameEventId) || (event.selectedFixedConfig == null)) {
          this.resetEventData(raceItem, true)
        }
        else {
          this.resetEventData(event, false)
        }

      });
    });
    console.log(event)
    if (event.selectedFixedConfig) {
      let selectedTypeId = event.selectedFixedConfig.ticketTypeId
      this.dataArray.forEach((reunionItem: any) => {
        reunionItem.events.forEach((raceItem: any) => {
          if (raceItem.gameEventId != event.gameEventId) {
            raceItem.isBettingDisabled = true
            raceItem.fixedConfigs.forEach((configItem: any) => {
              configItem.isSelected = false
            });
            raceItem.selectedFixedConfig = null

          }
        })
      })

      if (event.selectedFixedConfig.isParoli) {
        let selectedReunion = this.dataArray.find((reunionItem: any) => reunionItem.reunionCode == event.reunionCode)
        selectedReunion.events.forEach((raceItem: any) => {
          let sameConfig = raceItem.fixedConfigs.find((item: any) => item.ticketTypeId == selectedTypeId)
          if (sameConfig) {
            raceItem.selectedFixedConfig = event.selectedFixedConfig
            sameConfig.isSelected = true
            raceItem.isBettingDisabled = false
            raceItem.horseList.forEach((horseItem: any) => {
              horseItem.isDisabled = false
              horseItem.isParoli = true
            });
          }
        })

      }

      if (event.selectedFixedConfig.isForTicketTypeEvent == 1) {
        event.isDoubleMain = true
        event.horseList.forEach((horseItem: any) => {
          horseItem.isDisabled = false
          horseItem.isDouble = true
        });
        let selectedReunion = this.dataArray.find((reunionItem: any) => reunionItem.reunionCode == event.reunionCode)
        event.doubleGagnantConfiguration.forEach((allowedDG: any) => {
          let foundRace = selectedReunion.events.find((eventItem: any) => eventItem.gameEventId == allowedDG.secondaryGameEventId)
          foundRace.selectedFixedConfig = event.selectedFixedConfig

          foundRace.isBettingDisabled = false
          foundRace.horseList.forEach((horseItem: any) => {
            horseItem.isDisabled = false
            horseItem.isDouble = true
          });

          let sameConfig = foundRace.fixedConfigs.find((item: any) => item.ticketTypeId == selectedTypeId)
          if (sameConfig) {
            sameConfig.isSelected = true
          }

        });
      }

    }


    console.log(this.dataArray)
  }

  resetEventData(raceItem: any, resetConfig: boolean) {

    if (resetConfig) {
      raceItem.selectedFixedConfig = null
      raceItem.fixedConfigs.forEach((configItem: any) => {
        configItem.isSelected = false
      });
    }
    raceItem.baseHorses = []
    raceItem.associatedHorses = []
    raceItem.isDoubleMain = false
    raceItem.isBettingDisabled = false;
    raceItem.horseList.forEach((horseItem: any) => {
      horseItem.isDisabled = false
      horseItem.isParoli = false
      horseItem.isDouble = false
      horseItem.isBase = false
      horseItem.isAssociated = false
      horseItem.isSelected = false
    });
    console.log(raceItem)
  }

}
