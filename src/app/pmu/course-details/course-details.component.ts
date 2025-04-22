import { Component, EventEmitter, Host, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { GamesService } from 'src/app/services/games.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss'],
  standalone: false
})
export class CourseDetailsComponent {

  @Input() isFullPage = false

  @Input() courseDetails: any

  @Output() onEventBet = new EventEmitter<any>();

  cartListFromStorage = this.storageSrv.getItem('cartData')

  raceInCart = false

  selectedTypeOfBet: any

  fieldChoice = 1


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
    private gamesSrv: GamesService,
    private translate: TranslateService
  ) {


  }

  toggleSub(item: any) {
    item.isExpanded = !item.isExpanded
  }

  addToBet(horse: any) {
    if (this.courseDetails.selectedFixedConfig?.isParoli) {
      horse.isSelected = !horse.isSelected
      if (horse.isSelected) {
        this.courseDetails.baseHorses = []
        this.courseDetails.baseHorses.push(horse)
        this.courseDetails.horseList.forEach((horseItem: any) => {
          if (horseItem.horseId != horse.horseId) {
            horseItem.isSelected = false
          }
        });
      }
      else {
        this.courseDetails.baseHorses = []
      }

      this.setPmuBets(false);
      return
    }

    if (this.courseDetails.selectedFixedConfig?.isForTicketTypeEvent == 1) {
      horse.isSelected = !horse.isSelected
      if (this.courseDetails.isDoubleMain) {
        this.courseDetails.baseHorses = []
        if (horse.isSelected) {
          this.courseDetails.baseHorses.push(horse)
          this.courseDetails.horseList.forEach((horseItem: any) => {
            if (horseItem.horseId != horse.horseId) {
              horseItem.isSelected = false
            }
          });
        }
      }
      else {
        if (horse.isSelected) {
          this.courseDetails.baseHorses.push(horse)
        }
        else {
          this.courseDetails.baseHorses = this.courseDetails.baseHorses.filter((item: any) => item.horseId != horse.horseId)
        }
      }

      console.log(this.courseDetails)
      this.setPmuBets(false);
      return
    }

    if (!horse.isSelected) {
      let horseIndex = this.courseDetails.baseHorses.findIndex((horseItem: any) => horseItem.horseId == horse.horseId);
      if (horseIndex != -1) {
        if (this.fieldChoice == 1) {
          this.courseDetails.baseHorses.splice(horseIndex, 1)
        }
        else {
          this.courseDetails.baseHorses[this.courseDetails.baseHorses.indexOf(horse)] = {
            horseNameDisplay: 'XX',
            isDummy: true,
            isSelected: true,
            horseName: '00'
          }
        }

      }
      else {
        this.courseDetails.associatedHorses.splice(this.courseDetails.associatedHorses.indexOf(horse), 1)
      }

    }

    else {
      const targetArray = horse.isBase ? this.courseDetails.baseHorses : this.courseDetails.associatedHorses;
      const otherArray = horse.isBase ? this.courseDetails.associatedHorses : this.courseDetails.baseHorses;

      // Remove horse from the other array if it exists
      const otherArrayIndex = otherArray.findIndex((horseItem: any) => horseItem.horseId === horse.horseId);
      if (otherArrayIndex !== -1) {
        if (horse.isAssociated) {
          this.courseDetails.baseHorses[otherArrayIndex] = {
            horseNameDisplay: 'XX',
            isDummy: true,
            isSelected: true,
            horseName: '00'
          };
        } else {
          otherArray.splice(otherArrayIndex, 1);
        }
      }

      let isDummyReplaced = false;

      // Check if there's a dummy horse in the target array and replace it
      const dummyIndex = targetArray.findIndex((horseItem: any) => horseItem.isDummy === true);
      if (dummyIndex !== -1) {
        targetArray[dummyIndex] = horse;
        isDummyReplaced = true;
      }

      // If no dummy horse was replaced, add the horse to the target array
      if (!isDummyReplaced) {
        targetArray.push(horse);
      }


    }


    if (this.courseDetails.baseHorses.filter((horse: any) => horse.isDummy === true).length == 1) {
      this.courseDetails.horseList.forEach((horseItem: any) => {
        horseItem.isDisabled = true

      });
    }
    else {
      this.courseDetails.horseList.forEach((horseItem: any) => {
        horseItem.isDisabled = false
      });
    }

    this.setPmuBets(false);
  }

  chooseBetType(parisItem: any) {
    if (this.courseDetails.isBettingDisabled) {
      this.translate.get('alerts.complete_previous_bet').subscribe((translatedMsg: string) => {
        console.log(translatedMsg)
        alert(translatedMsg);
      });
      return
    }

    this.resetSelections();

    if (parisItem.isSelected) {
      parisItem.isSelected = false;
      this.courseDetails.selectedFixedConfig = null
      this.courseDetails.selectedFormule = null
    }

    else {
      this.courseDetails.fixedConfigs.forEach((item: any) => {
        item.isSelected = false;
        this.courseDetails.selectedFixedConfig = null
      });

      parisItem.isSelected = true;
      this.courseDetails.selectedFixedConfig = this.courseDetails.fixedConfigs.find((item: any) => item.isSelected == true)
      this.changeFieldType(1, true)

    }
    this.onEventBet.emit(this.courseDetails)
    this.setPmuBets(true);
  }

  setPmuBets(isTypeChange: boolean) {

    if (!this.courseDetails.price || isTypeChange) {
      this.courseDetails.price = this.courseDetails.selectedFixedConfig?.singlePrice
    }
    if ((this.courseDetails.baseHorses.find((horse: any) => horse.isSelected == true) == undefined) || (this.courseDetails.fixedConfigs.find((item: any) => item.isSelected == true) == undefined)) {
      this.courseDetails.showRace = false
    }

    else {
      this.courseDetails.showRace = true
    }



    //console.log(this.courseDetails)
    this.courseDetails.typeChanged = isTypeChange
    this.cartSrv.setPmuBets(this.courseDetails);
  }

  changeFieldType(event: any, isAutoChange?: boolean) {
    this.resetSelections()
    this.fieldChoice = event
    this.courseDetails.fieldChoice = event
    this.courseDetails.selectedFormule = this.typesList.find((item: any) => item.id == event)
    //console.log('here')
    //console.log(this.courseDetails)
    if (this.fieldChoice != 1) {
      for (let index = 0; index < this.courseDetails.selectedFixedConfig.horsesNumberTelpo; index++) {
        this.courseDetails.baseHorses.push({
          horseNameDisplay: 'XX',
          isDummy: true,
          isSelected: true,
          horseName: '00'
        })

      }
    }
    if (!isAutoChange) {
      this.setPmuBets(false)
    }


  }

  resetSelections() {
    this.fieldChoice = 1;
    this.courseDetails.baseHorses = []
    this.courseDetails.associatedHorses = []


    this.courseDetails.horseList.forEach((horseItem: any) => {
      horseItem.isSelected = false
      horseItem.isBase = false
      horseItem.isAssociated = false
      horseItem.isDisabled = false
    });
  }

}
