import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-bp-hero',
    standalone: false,
    templateUrl: './bp-hero.component.html',
    styleUrls: ['./bp-hero.component.scss']
})
export class BpHeroComponent {
    @Input() imageUrl = '';
    @Input() imageAlt = '';
    @Input() title = '';
    @Input() description = '';
}
