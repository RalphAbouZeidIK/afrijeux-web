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

  @Input() showTime = false

  @Input() timeLabel = 'Time'

  /**
  * Output to pass the sorting event
  */
  @Output() dateChangeEvent = new EventEmitter<any>();

  @Input() parentClass: string = ''

  dateChosen = new Date()

  timeChosen = '00:00'

  constructor(public datepipe: DatePipe) {

  }

  ngOnInit(): void {
    if (this.initialDate) {
      this.dateChosen = this.initialDate;
      if (this.showTime) {
        this.timeChosen = this.datepipe.transform(this.initialDate, 'HH:mm') || '00:00';
      }
    }
    this.dateChangeEvent.emit(this.datepipe.transform(this.dateChosen, 'yyyy-MM-ddTHH:mm:ss.SSS'))
  }

  dateChange(event: any) {
    //console.log(event)
    if (this.showTime) {
      this.emitWithTime(event);
      return;
    }
    this.dateChangeEvent.emit(event.format('YYYY-MM-DDTHH:mm:ss'))
  }

  timeChange() {
    this.emitWithTime(this.dateChosen)
  }

  private emitWithTime(dateValue: any) {
    const jsDate: Date = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue);
    const [hours, minutes] = this.timeChosen.split(':').map(Number);
    jsDate.setHours(hours, minutes, 0, 0);
    this.dateChangeEvent.emit(this.datepipe.transform(jsDate, 'yyyy-MM-ddTHH:mm:ss.SSS'))
  }
}
