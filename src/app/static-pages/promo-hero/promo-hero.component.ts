import { Component } from '@angular/core';

@Component({
    selector: 'app-promo-hero',
    standalone: false,
    templateUrl: './promo-hero.component.html',
    styleUrls: ['./promo-hero.component.scss']
})
export class PromoHeroComponent {
    imgDiamond = 'assets/images/diamond-icon.svg';
    imgIcon1 = 'assets/images/htp-type.svg';
    imgIcon2 = 'assets/images/htp-pick.svg';
    imgIcon3 = 'assets/images/htp-details.svg';

    features = [
        {
            title: 'Choose The Type',
            text: 'Place bets using several play types: Straight, Rumble, Chance, or Reverse Straight. Each type has its own rules & payout structure.',
            icon: this.imgIcon1
        },
        {
            title: 'Pick Your Numbers',
            text: 'Exciting lottery-style games where players select a combination (digits from 0 to 9). The games allow repetition of digits.',
            icon: this.imgIcon2
        },
        {
            title: 'More Details?',
            text: 'For more details? Visit the games pages for detailed guides to enhance your experience. Learn more and get the most out of your gameplay!',
            icon: this.imgIcon3
        }
    ];
}
