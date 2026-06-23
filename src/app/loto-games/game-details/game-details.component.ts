import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-game-details',
    templateUrl: './game-details.component.html',
    styleUrls: ['./game-details.component.scss'],
    standalone: false
})
export class GameDetailsComponent implements OnInit {
    @Input() drawInfoTitle: string = 'Draw and Frequency';
    @Input() drawInfoText: string = '';

    @Input() highlightsTitle: string = 'Technical Highlights';
    @Input() highlights: string[] = [];

    @Input() exampleTitle: string = 'Example Calculations';
    @Input() examples: string[] = [];

    @Input() imageUrl: string = '/assets/images/details-icon.svg';

    constructor() { }

    ngOnInit(): void { }
}
