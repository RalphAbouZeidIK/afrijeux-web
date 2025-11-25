import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
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
export class CoursesComponent implements OnInit, OnDestroy {

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

  timeStamp = this.datePipe.transform(new Date(), 'HH:mm')

  constructor(
    private router: Router,
    private gamesSrv: GamesService,
    private cartSrv: CartService,
    private gnrcSrv: GenericService,
    private machineSrv: MachineService,
    public datePipe: DatePipe
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
    this.isFullPage = true
    const currentUrl = this.router.url;
    if (currentUrl.includes('courses-francaises') || currentUrl.includes('courses')) {
      this.isFullPage = true
    }
    if (currentUrl.includes('courses-francaises')) {
      this.countryCode = 'Fr'
    }
    this.getGameEvents()
  };


  async getRaceById(reunionId: any, raceId: any) {

  }

  /**
   * Expand Collapse function
   */

  toggleSub(item: any) {
    item.IsExpanded = !item.IsExpanded
  }

  async getGameEvents() {
    let gameEventsResponse: any

    if (this.isAndroidApp) {
      gameEventsResponse = await this.machineSrv.getGameEvents()
      console.log(gameEventsResponse)
      const now = new Date();
      const upcoming = gameEventsResponse.GameConfiguration.EventConfiguration.filter((event: any) => {
        return new Date(event.CloseSales) > now;
      });

      ////console.log(upcoming)

      const groupedRaces = this.groupByCategory(upcoming);
      this.dataArray = Object.values(groupedRaces)

      if (this.dataArray) {
        this.dataArray.forEach((reunionItem: any) => {
          reunionItem.Events.forEach((raceItem: any) => {
            this.composeEventDetails(raceItem)
          });
        });

      }
      ////console.log(this.dataArray)
    }

    else {
      gameEventsResponse = await this.gamesSrv.getGameEvents(this.date, this.countryCode)
      this.dataArray = gameEventsResponse.EventConfiguration
      if (this.dataArray) {
        this.dataArray.forEach((reunionItem: any) => {
          reunionItem.Events.forEach((raceItem: any) => {
            this.getEventConfig(raceItem)
          });
        });

      }
    }
    ////////console.log(this.dataArray)

  }

  groupByCategory(events: any): { ReunionCode: string, Events: any }[] {
    // Group races by category
    const grouped = events.reduce((acc: any, race: any) => {
      if (!acc[race.ReunionCode]) {
        acc[race.ReunionCode] = [];
      }
      acc[race.ReunionCode].push(race);
      return acc;
    }, {} as Record<string, any>);

    // Convert the grouped data into the desired format
    return Object.keys(grouped).map(ReunionCode => ({
      ReunionCode,
      Events: grouped[ReunionCode],
      ReunionName: ReunionCode
    }));
  }

  onDateChange(event: any) {
    this.date = event
    this.getGameEvents()
  }

  async getEventConfig(raceItem: any) {
    raceItem.FixedConfigs.forEach((fixedConfigItem: any) => {
      fixedConfigItem.IsSelected = false
      fixedConfigItem.IsParoli = false

      if (fixedConfigItem.isCumulative && fixedConfigItem.isMultiEvent) {
        fixedConfigItem.IsParoli = true
      }
    });

    raceItem.BaseHorses = []
    raceItem.AssociatedHorses = []

    raceItem.HorseList.forEach((horseItem: any) => {
      (horseItem.StartingStatus == 1) ? horseItem.IsNoPartant = false : horseItem.IsNoPartant = true
      horseItem.IsExpanded = false,
        horseItem.isDisabled = true
      horseItem.HorseName = horseItem.HorseName.padStart(2, '0');
    });

    raceItem.IsExpanded = false
    ////////console.log(raceItem)
  }

  resetOnEventChange(data: any) {
    ////////console.log(data)
    if (data.SelectedFixedConfig.IsForTicketTypeEvent == 1) {
      let sameReunion = this.dataArray.find((item: any) => item.reunionCode == data.reunionCode)
      if (sameReunion) {
        sameReunion.Events.forEach((eventItem: any) => {
          if (!eventItem.IsDoubleMain && (eventItem.GameEventId != data.GameEventId)) {
            eventItem.BaseHorses = []
            eventItem.AssociatedHorses = []
            eventItem.HorseList.forEach((horseItem: any) => {
              horseItem.IsSelected = false
            });
          }
        });
      }

    }
  }


  eventBetSet(event: any) {
    //console.log(event)
    this.dataArray.forEach((reunionItem: any) => {
      reunionItem.Events.forEach((raceItem: any) => {
        if ((raceItem.GameEventId != event.GameEventId) || (event.SelectedFixedConfig == null)) {
          this.resetEventData(raceItem, true)
        }
        else {
          this.resetEventData(event, false)
        }

      });
    });
    ////////console.log(event)
    if (event.SelectedFixedConfig) {
      let selectedTypeId = event.SelectedFixedConfig.TicketTypeId
      this.dataArray.forEach((reunionItem: any) => {
        reunionItem.Events.forEach((raceItem: any) => {
          if (raceItem.GameEventId != event.GameEventId) {
            raceItem.IsBettingDisabled = true
            raceItem.FixedConfigs.forEach((configItem: any) => {
              configItem.IsSelected = false
            });
            raceItem.SelectedFixedConfig = null

          }
        })
      })

      if (event.SelectedFixedConfig.IsParoli) {
        let selectedReunion = this.dataArray.find((reunionItem: any) => reunionItem.reunionCode == event.reunionCode)
        selectedReunion.Events.forEach((raceItem: any) => {
          let sameConfig = raceItem.FixedConfigs.find((item: any) => item.TicketTypeId == selectedTypeId)
          if (sameConfig) {
            raceItem.SelectedFixedConfig = event.SelectedFixedConfig
            sameConfig.IsSelected = true
            raceItem.IsBettingDisabled = false
            raceItem.HorseList.forEach((horseItem: any) => {
              horseItem.isDisabled = false
              horseItem.IsParoli = true
            });
          }
        })

      }

      if (event.SelectedFixedConfig.IsForTicketTypeEvent == 1) {
        event.IsDoubleMain = true
        event.HorseList.forEach((horseItem: any) => {
          horseItem.isDisabled = false
          horseItem.IsDouble = true
        });
        let selectedReunion = this.dataArray.find((reunionItem: any) => reunionItem.reunionCode == event.reunionCode)
        event.doubleGagnantConfiguration.forEach((allowedDG: any) => {
          let foundRace = selectedReunion.Events.find((eventItem: any) => eventItem.GameEventId == allowedDG.secondaryGameEventId)
          foundRace.SelectedFixedConfig = event.SelectedFixedConfig

          foundRace.IsBettingDisabled = false
          foundRace.HorseList.forEach((horseItem: any) => {
            horseItem.isDisabled = false
            horseItem.IsDouble = true
          });

          let sameConfig = foundRace.FixedConfigs.find((item: any) => item.TicketTypeId == selectedTypeId)
          if (sameConfig) {
            sameConfig.IsSelected = true
          }

        });
      }

    }


    ////////console.log(this.dataArray)
  }

  async composeEventDetails(raceItem: any) {
    let fixedConfig = await this.machineSrv.getFixedConfiguration(raceItem.FixedConfigurationVersion)
    ////////console.log(fixedConfig)

    // Build a lookup from array a
    const idsInA = new Set(raceItem.GameEventTicketTypeConfiguration.map((item: any) => item.TicketTypeId));

    // Filter b to keep only items that exist in a
    const filteredB = fixedConfig.filter((item: any) => idsInA.has(item.TicketTypeId));
    ////////console.log(filteredB)

    raceItem.FixedConfigs = filteredB
    raceItem.FixedConfigs.forEach((fixedConfigItem: any) => {
      fixedConfigItem.IsSelected = false
      fixedConfigItem.IsParoli = false

      if (fixedConfigItem.isCumulative && fixedConfigItem.isMultiEvent) {
        fixedConfigItem.IsParoli = true
      }
    })

    raceItem.BaseHorses = []
    raceItem.AssociatedHorses = []
    raceItem.HorseList = []
    const nonPartantIds = raceItem.NonPartant
      ? raceItem.NonPartant.split(",").map((id: any) => parseInt(id.trim(), 10))
      : [];

    for (let index = 0; index < raceItem.HorseNumber; index++) {
      const HorseId = index + 1;

      raceItem.HorseList.push({
        HorseId: HorseId,
        HorseName: HorseId.toString().padStart(2, '0'),
        IsNoPartant: nonPartantIds.includes(HorseId) // 👈 check here
      });
    }

    raceItem.Multiplier = 1
    ////////console.log(raceItem)
  }

  resetEventData(raceItem: any, resetConfig: boolean) {

    if (resetConfig) {
      raceItem.SelectedFixedConfig = null
      raceItem.FixedConfigs.forEach((configItem: any) => {
        configItem.IsSelected = false
      });
    }
    raceItem.BaseHorses = []
    raceItem.AssociatedHorses = []
    raceItem.IsDoubleMain = false
    raceItem.IsBettingDisabled = false;
    raceItem.HorseList.forEach((horseItem: any) => {
      horseItem.isDisabled = false
      horseItem.IsParoli = false
      horseItem.IsDouble = false
      horseItem.IsBase = false
      horseItem.IsAssociated = false
      horseItem.IsSelected = false
    });
  }

  ngOnDestroy(): void {
    this.cartSrv.getEventFromCart().unsubscribe
    this.cartSrv.getResetOtherEvents().unsubscribe
  }
}
