import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ball-list',
  standalone: false,
  templateUrl: './ball-list.component.html',
  styleUrl: './ball-list.component.scss'
})
export class BallListComponent implements OnInit {
  @Input() chosenBallsArray: any = [];

  @Output() ballClicked = new EventEmitter<object>();

  @Input() shouldHighlight = true

  @Input() shouldEmit = true

  getBallClass(ballNumber: number | string): string {

    if (ballNumber === 'X') return 'emptyBox';

    const num = Number(ballNumber);
    const group = Math.floor(num / 11);

    const classes = ['yellowBox', 'purpleBox', 'orangeBox', 'greenBox', 'blueBox', 'redBox', 'darkBlueBox', 'marronBox', 'purpleBox'];

    return classes[group] || '';
  }

  ngOnInit() {
    console.log('Chosen Balls Array:', this.chosenBallsArray);
  }
}
