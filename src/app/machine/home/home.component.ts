import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent {

  carouselImages = [
    { id: '1', url: 'assets/images/carousel-1.png', alt: 'Carousel Image 1' },
    { id: '2', url: 'assets/images/carousel-2.jpg', alt: 'Carousel Image 2' },
    { id: '3', url: 'assets/images/carousel-3.jpg', alt: 'Carousel Image 3' }
  ];

  constructor() {

  }
}

