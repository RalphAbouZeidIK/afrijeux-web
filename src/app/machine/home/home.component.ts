import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { machineMenuRoutes } from '../machine-route';
import { MachineService } from 'src/app/services/machine.service';
import { NativeBridgeService } from 'src/app/services/native-bridge.service';
import { GenericService } from 'src/app/services/generic.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false
})
export class HomeComponent {

  carouselImages = [
    { id: '1', url: 'assets/images/carousel-1.png', alt: 'Carousel Image 1' },
    // { id: '2', url: 'assets/images/carousel-2.jpg', alt: 'Carousel Image 2' },
    // { id: '3', url: 'assets/images/carousel-3.jpg', alt: 'Carousel Image 3' }
  ];

  constructor() {

  }
}

