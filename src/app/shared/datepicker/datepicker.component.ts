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

  timeHours = '00'

  timeMinutes = '00'

  constructor(public datepipe: DatePipe) {

  }

  ngOnInit(): void {
    if (this.initialDate) {
      this.dateChosen = this.initialDate;
      if (this.showTime) {
        this.timeHours = this.datepipe.transform(this.initialDate, 'HH') || '00';
        this.timeMinutes = this.datepipe.transform(this.initialDate, 'mm') || '00';
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

  selectAllText(event: any) {
    event.target.select()
  }

  onHoursChange() {
    this.timeHours = this.clamp(this.timeHours, 23)
    this.timeChange()
  }

  onMinutesChange() {
    this.timeMinutes = this.clamp(this.timeMinutes, 59)
    this.timeChange()
  }

  private clamp(value: string, max: number): string {
    let num = parseInt(value, 10)
    if (isNaN(num)) num = 0
    num = Math.min(Math.max(num, 0), max)
    return num.toString().padStart(2, '0')
  }

  private emitWithTime(dateValue: any) {
    const jsDate: Date = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue);
    jsDate.setHours(Number(this.timeHours), Number(this.timeMinutes), 0, 0);
    this.dateChangeEvent.emit(this.datepipe.transform(jsDate, 'yyyy-MM-ddTHH:mm:ss.SSS'))
  }
}
