import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-datepicker',
    templateUrl: './datepicker.component.html',
    styleUrls: ['./datepicker.component.scss'],
    standalone: false
})
export class DatepickerComponent {
  @Input() minDate: any = null

  /**
  * Output to pass the sorting event
  */
  @Output() dateChangeEvent = new EventEmitter<any>();

  @Input() parentClass: string = ''

  dateChosen = new Date()

  dateChange(event: any) {
    this.dateChangeEvent.emit(event.format('YYYY-MM-DDTHH:mm:ss'))
  }
}
