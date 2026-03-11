import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-banner',
  standalone: false,
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss'
})
export class HeroBannerComponent {
  lotteryMachineImage = 'assets/images/lottery-machine.png';
  vectorStriped1 = 'assets/images/vector-1.svg';
  vectorStriped2 = 'assets/images/vector-2.svg';
  vectorStriped3 = 'assets/images/vector-3.svg';
  vectorGlow1 = 'assets/images/glow-1.svg';
  vectorGlow2 = 'assets/images/glow-2.svg';

  @Input() allEvents: any = [];

}
