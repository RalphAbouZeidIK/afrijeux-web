import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss'],
    standalone: false
})
export class BannerComponent {
  @Input() backgroundImageUrl = ''
  @Input() title = ''
  @Input() description = ''
  @Input() linkText = ''
  @Input() logoSrc = ''
}
