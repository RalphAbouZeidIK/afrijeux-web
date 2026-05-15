import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent {

  carouselImages = [
    { id: '1', url: 'assets/images/banner1-new.png', alt: 'Banner 1' },
    { id: '2', url: 'assets/images/banner2-new.png', alt: 'Banner 2' },
    { id: '3', url: 'assets/images/banner3-new.png', alt: 'Banner 3' },
    { id: '4', url: 'assets/images/banner4-new.png', alt: 'Banner 4' },
    { id: '6', url: 'assets/images/banner6-new.png', alt: 'Banner 6' }
  ];

  constructor() {

  }
}

