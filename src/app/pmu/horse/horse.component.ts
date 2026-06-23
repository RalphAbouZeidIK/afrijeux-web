import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GenericService } from 'src/app/services/generic.service';

@Component({
    selector: 'app-horse',
    templateUrl: './horse.component.html',
    styleUrls: ['./horse.component.scss'],
    standalone: false
})
export class HorseComponent implements OnInit {
  @Input() horse: any

  @Input() FieldChoice = 1

  @Input() IsBettingDisabled = false

  isAndroidApp = false

  /**
   * Event emiter on horse select 
   */
  @Output() addToBet = new EventEmitter<any>();

   constructor(
      private translate:TranslateService,
      private gnrcSrv: GenericService
    ) {
  
  
    }

  ngOnInit(): void {
    this.isAndroidApp = this.gnrcSrv.isMachineApp()
  }

  addHorseToBet(horse: any, horseType: string) {
    if (this.IsBettingDisabled) {
      this.translate.get('alerts.complete_previous_bet').subscribe((translatedMsg: string) => {
        alert(translatedMsg);
      });
      return
    }


    if (horse.IsNoPartant) {
      return
    }
    if (horse.IsParoli || horse.IsDouble) {
      this.addToBet.emit(horse);
      return
    }

    else {
      // If horse is disabled, prevent modifying the base checkbox (IsBase)
      if (horseType === 'IsBase' && horse.isDisabled && !horse.IsBase) {
        return;
      }

      // Toggle the checkboxes based on the type
      switch (horseType) {
        case 'IsBase':
          horse.IsBase = !horse.IsBase;  // Toggle base
          horse.IsAssociated = false;   // Reset associated when base is toggled
          break;
        case 'IsAssociated':
          horse.IsAssociated = !horse.IsAssociated;  // Toggle associated
          horse.IsBase = false;  // Reset base when associated is toggled
          break;
        default:
          break;
      }

      // Update the selection state based on base or associated status
      horse.IsSelected = horse.IsBase || horse.IsAssociated;
    }


    // Emit the updated horse object
    this.addToBet.emit(horse);
  }




  /**
    * Expand Collapse function
    */
  toggleSub(item: any) {
    item.IsExpanded = !item.IsExpanded
  }
}
