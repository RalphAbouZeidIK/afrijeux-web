import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface CarouselImage {
  id: string;
  url: string;
  alt?: string;
}

@Component({
  selector: 'app-carousel',
  standalone: false,
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() images: CarouselImage[] = [];
  @Input() autoPlayInterval: number = 5000; // 5 seconds
  @Input() autoPlay: boolean = true;
  @Input() showIndicators: boolean = true;
  @Input() showArrows: boolean = true;

  currentIndex: number = 0;
  private destroy$ = new Subject<void>();
  private autoPlaySubscription: any;

  ngOnInit(): void {
    if (this.autoPlay && this.images.length > 0) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.resetAutoPlay();
  }

  previous(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.resetAutoPlay();
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.currentIndex = index;
      this.resetAutoPlay();
    }
  }

  private startAutoPlay(): void {
    this.autoPlaySubscription = interval(this.autoPlayInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
      });
  }

  private resetAutoPlay(): void {
    if (this.autoPlay && this.images.length > 0) {
      if (this.autoPlaySubscription) {
        this.autoPlaySubscription.unsubscribe();
      }
      this.startAutoPlay();
    }
  }

  get currentImage(): CarouselImage | undefined {
    return this.images[this.currentIndex];
  }
}
