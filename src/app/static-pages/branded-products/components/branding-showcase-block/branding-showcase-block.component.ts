import { Component, Input } from '@angular/core';

export interface ShowcaseItem {
    label?: string ;
    text: string;
}

@Component({
    selector: 'app-branding-showcase-block',
    standalone: false,
    templateUrl: './branding-showcase-block.component.html',
    styleUrls: ['./branding-showcase-block.component.scss']
})
export class BrandingShowcaseBlockComponent {
    @Input() title = '';
    @Input() items: ShowcaseItem[] = [];
    @Input() reverse = false;
    @Input() imageUrl = '';
}
