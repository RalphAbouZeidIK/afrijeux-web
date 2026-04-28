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
  touchStartX: number | null = null;
  private readonly swipeThreshold = 50;
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

  get trackTransform(): string {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  onPointerDown(event: PointerEvent): void {
    this.touchStartX = event.clientX;
  }

  onPointerUp(event: PointerEvent): void {
    if (this.touchStartX === null) {
      return;
    }

    const deltaX = event.clientX - this.touchStartX;
    this.touchStartX = null;

    if (Math.abs(deltaX) < this.swipeThreshold) {
      return;
    }

    if (deltaX > 0) {
      this.previous();
    } else {
      this.next();
    }
  }

  onPointerCancel(): void {
    this.touchStartX = null;
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
