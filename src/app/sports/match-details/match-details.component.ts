import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-match-details',
  templateUrl: './match-details.component.html',
  styleUrls: ['./match-details.component.scss'],
  standalone:false
})
export class MatchDetailsComponent {
  @Input() matchDetails: any

}
