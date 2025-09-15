import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-horse',
    templateUrl: './horse.component.html',
    styleUrls: ['./horse.component.scss'],
    standalone: false
})
export class HorseComponent {
  @Input() horse: any

  @Input() fieldChoice = 1

  @Input() isBettingDisabled = false

  /**
   * Event emiter on horse select 
   */
  @Output() addToBet = new EventEmitter<any>();

   constructor(
      private translate:TranslateService
    ) {
  
  
    }

  addHorseToBet(horse: any, horseType: string) {
    if (this.isBettingDisabled) {
      this.translate.get('alerts.complete_previous_bet').subscribe((translatedMsg: string) => {
        alert(translatedMsg);
      });
      return
    }


    if (horse.isNoPartant) {
      return
    }
    if (horse.isParoli || horse.isDouble) {
      this.addToBet.emit(horse);
      return
    }

    else {
      // If horse is disabled, prevent modifying the base checkbox (isBase)
      if (horseType === 'isBase' && horse.isDisabled && !horse.isBase) {
        return;
      }

      // Toggle the checkboxes based on the type
      switch (horseType) {
        case 'isBase':
          horse.isBase = !horse.isBase;  // Toggle base
          horse.isAssociated = false;   // Reset associated when base is toggled
          break;
        case 'isAssociated':
          horse.isAssociated = !horse.isAssociated;  // Toggle associated
          horse.isBase = false;  // Reset base when associated is toggled
          break;
        default:
          break;
      }

      // Update the selection state based on base or associated status
      horse.isSelected = horse.isBase || horse.isAssociated;
    }


    // Emit the updated horse object
    this.addToBet.emit(horse);
  }




  /**
    * Expand Collapse function
    */
  toggleSub(item: any) {
    item.isExpanded = !item.isExpanded
  }
}
