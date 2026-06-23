import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';

@Component({
    selector: 'app-bp-hero',
    standalone: false,
    templateUrl: './bp-hero.component.html',
    styleUrls: ['./bp-hero.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition('* => *', [
                style({ opacity: 0 }),
                animate('600ms ease-in-out', style({ opacity: 1 }))
            ])
        ])
    ]
})
export class BpHeroComponent implements OnInit, OnDestroy {
    @Input() imageUrl = '';
    @Input() imageAlt = '';
    @Input() title = '';
    @Input() description = '';
    @Input() carouselInterval = 5000; // Rotate every 5 seconds

    titles: string[] = [];
    currentTitleIndex = 0;
    currentTitle = '';
    private carouselTimer: any;

    ngOnInit() {
        // Initialize titles array with primary title and carousel title
        if (this.title) {
            this.titles = [
                this.title,
                'Purchase any of our products now to enter our grand prize draw'
            ];
            this.currentTitle = this.titles[0];
            this.startCarousel();
        }
    }

    ngOnDestroy() {
        this.stopCarousel();
    }

    private startCarousel() {
        this.carouselTimer = setInterval(() => {
            this.currentTitleIndex = (this.currentTitleIndex + 1) % this.titles.length;
            this.currentTitle = this.titles[this.currentTitleIndex];
        }, this.carouselInterval);
    }

    private stopCarousel() {
        if (this.carouselTimer) {
            clearInterval(this.carouselTimer);
        }
    }
}
