import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  standalone: false
})
export class DatepickerComponent implements OnInit {
  @Input() minDate: any = null

  @Input() label = 'Choose Date'

  @Input() initialDate: Date | null = null

  /**
  * Output to pass the sorting event
  */
  @Output() dateChangeEvent = new EventEmitter<any>();

  @Input() parentClass: string = ''

  dateChosen = new Date()

  constructor(public datepipe: DatePipe) {

  }

  ngOnInit(): void {
    if (this.initialDate) {
      this.dateChosen = this.initialDate;
    }
    this.dateChangeEvent.emit(this.datepipe.transform(this.dateChosen, 'yyyy-MM-ddTHH:mm:ss.SSS'))
  }

  dateChange(event: any) {
    //console.log(event)
    this.dateChangeEvent.emit(event.format('YYYY-MM-DDTHH:mm:ss'))
  }
}
