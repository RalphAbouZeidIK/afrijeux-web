import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-branding-benefit-card',
    standalone: false,
    templateUrl: './branding-benefit-card.component.html',
    styleUrls: ['./branding-benefit-card.component.scss']
})
export class BrandingBenefitCardComponent {
    @Input() title = '';
    @Input() description = '';
    @Input() icon: 'customize' | 'quality' | 'lightning' = 'customize';
}
