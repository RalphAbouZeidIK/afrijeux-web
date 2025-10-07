import { Component, EventEmitter, Host, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { GamesService } from 'src/app/services/games.service';
import { GenericService } from 'src/app/services/generic.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss'],
  standalone: false
})
export class CourseDetailsComponent implements OnInit {

  @Input() isFullPage = false

  @Input() courseDetails: any

  @Output() onEventBet = new EventEmitter<any>();

  cartListFromStorage = this.storageSrv.getItem('cartData')

  raceInCart = false

  selectedTypeOfBet: any

  FieldChoice = 1

  isAndroidApp = false


  typesList = [{
    "id": 1,
    "name": "Champ Simple"
  },
  {
    "id": 2,
    "name": "Champ Reduit",
    "description": "Champ Reduit"
  },
  {
    "id": 3,
    "name": "Champ Total",
    "description": "Champ Total"
  },
  ]

  constructor(
    private cartSrv: CartService,
    private storageSrv: LocalStorageService,
    private gnrcSrv: GenericService,
    private translate: TranslateService
  ) {


  }
  ngOnInit(): void {
    this.isAndroidApp = this.gnrcSrv.isMachineApp()
  }

  toggleSub(item: any) {
    item.IsExpanded = !item.IsExpanded
  }

  addToBet(horse: any) {

    if (this.courseDetails.SelectedFixedConfig?.IsParoli) {
      horse.IsSelected = !horse.IsSelected
      if (horse.IsSelected) {
        this.courseDetails.BaseHorses = []
        this.courseDetails.BaseHorses.push(horse)
        this.courseDetails.HorseList.forEach((horseItem: any) => {
          if (horseItem.HorseId != horse.HorseId) {
            horseItem.IsSelected = false
          }
        });
      }
      else {
        this.courseDetails.BaseHorses = []
      }

      this.setPmuBets(false);
      return
    }

    if (this.courseDetails.SelectedFixedConfig?.IsForTicketTypeEvent == 1) {
      horse.IsSelected = !horse.IsSelected
      if (this.courseDetails.IsDoubleMain) {
        this.courseDetails.BaseHorses = []
        if (horse.IsSelected) {
          this.courseDetails.BaseHorses.push(horse)
          this.courseDetails.HorseList.forEach((horseItem: any) => {
            if (horseItem.HorseId != horse.HorseId) {
              horseItem.IsSelected = false
            }
          });
        }
      }
      else {
        if (horse.IsSelected) {
          this.courseDetails.BaseHorses.push(horse)
        }
        else {
          this.courseDetails.BaseHorses = this.courseDetails.BaseHorses.filter((item: any) => item.HorseId != horse.HorseId)
        }
      }

      //console.log(this.courseDetails)
      this.setPmuBets(false);
      return
    }

    if (!horse.IsSelected) {
      let horseIndex = this.courseDetails.BaseHorses.findIndex((horseItem: any) => horseItem.HorseId == horse.HorseId);
      if (horseIndex != -1) {
        if (this.FieldChoice == 1) {
          this.courseDetails.BaseHorses.splice(horseIndex, 1)
        }
        else {
          this.courseDetails.BaseHorses[this.courseDetails.BaseHorses.indexOf(horse)] = {
            HorseNameDisplay: 'XX',
            IsDummy: true,
            isSelected: true,
            HorseName: '00'
          }
        }

      }
      else {
        this.courseDetails.AssociatedHorses.splice(this.courseDetails.AssociatedHorses.indexOf(horse), 1)
      }

    }

    else {
      const targetArray = horse.IsBase ? this.courseDetails.BaseHorses : this.courseDetails.AssociatedHorses;
      const otherArray = horse.IsBase ? this.courseDetails.AssociatedHorses : this.courseDetails.BaseHorses;

      // Remove horse from the other array if it exists
      const otherArrayIndex = otherArray.findIndex((horseItem: any) => horseItem.HorseId === horse.HorseId);
      if (otherArrayIndex !== -1) {
        if (horse.IsAssociated) {
          this.courseDetails.BaseHorses[otherArrayIndex] = {
            HorseNameDisplay: 'XX',
            IsDummy: true,
            isSelected: true,
            HorseName: '00'
          };
        } else {
          otherArray.splice(otherArrayIndex, 1);
        }
      }

      let IsDummyReplaced = false;

      // Check if there's a dummy horse in the target array and replace it
      const dummyIndex = targetArray.findIndex((horseItem: any) => horseItem.IsDummy === true);
      if (dummyIndex !== -1) {
        targetArray[dummyIndex] = horse;
        IsDummyReplaced = true;
      }

      // If no dummy horse was replaced, add the horse to the target array
      if (!IsDummyReplaced) {
        targetArray.push(horse);
      }


    }


    if (this.courseDetails.BaseHorses.filter((horse: any) => horse.IsDummy === true).length == 1) {
      this.courseDetails.HorseList.forEach((horseItem: any) => {
        horseItem.isDisabled = true

      });
    }
    else {
      this.courseDetails.HorseList.forEach((horseItem: any) => {
        horseItem.isDisabled = false
      });
    }

    this.setPmuBets(false);
  }

  chooseBetType(parisItem: any) {
    if (this.courseDetails.IsBettingDisabled) {
      this.translate.get('alerts.complete_previous_bet').subscribe((translatedMsg: string) => {
        //console.log(translatedMsg)
        alert(translatedMsg);
      });
      return
    }

    this.resetSelections();

    if (parisItem.IsSelected) {
      parisItem.IsSelected = false;
      this.courseDetails.SelectedFixedConfig = null
      this.courseDetails.SelectedFormule = null
    }

    else {
      this.courseDetails.FixedConfigs.forEach((item: any) => {
        item.IsSelected = false;
        this.courseDetails.SelectedFixedConfig = null
      });

      parisItem.IsSelected = true;
      this.courseDetails.SelectedFixedConfig = this.courseDetails.FixedConfigs.find((item: any) => item.IsSelected == true)
      this.changeFieldType(1, true)

    }
    this.onEventBet.emit(this.courseDetails)
    this.setPmuBets(true);
  }

  setPmuBets(IsTypeChange: boolean) {

    if (!this.courseDetails.price || IsTypeChange) {
      this.courseDetails.price = this.courseDetails.SelectedFixedConfig?.SinglePrice
    }
    if ((this.courseDetails.BaseHorses.find((horse: any) => horse.IsSelected == true) == undefined) || (this.courseDetails.FixedConfigs.find((item: any) => item.IsSelected == true) == undefined)) {
      this.courseDetails.ShowRace = false
    }

    else {
      this.courseDetails.ShowRace = true
    }



    ////console.log(this.courseDetails)
    this.courseDetails.TypeChanged = IsTypeChange
    this.cartSrv.setPmuBets(this.courseDetails);
  }

  changeFieldType(event: any, isAutoChange?: boolean) {
    this.resetSelections()
    this.FieldChoice = event
    this.courseDetails.FieldChoice = event
    this.courseDetails.SelectedFormule = this.typesList.find((item: any) => item.id == event)
    ////console.log('here')
    ////console.log(this.courseDetails)
    if (this.FieldChoice != 1) {
      for (let index = 0; index < this.courseDetails.SelectedFixedConfig.HorsesNumberTelpo; index++) {
        this.courseDetails.BaseHorses.push({
          HorseNameDisplay: 'XX',
          IsDummy: true,
          isSelected: true,
          HorseName: '00'
        })

      }
    }
    if (!isAutoChange) {
      this.setPmuBets(false)
    }


  }

  resetSelections() {
    this.FieldChoice = 1;
    this.courseDetails.BaseHorses = []
    this.courseDetails.AssociatedHorses = []


    this.courseDetails.HorseList.forEach((horseItem: any) => {
      horseItem.IsSelected = false
      horseItem.IsBase = false
      horseItem.IsAssociated = false
      horseItem.isDisabled = false
    });
  }

}
