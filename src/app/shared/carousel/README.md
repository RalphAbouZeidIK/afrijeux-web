# Image Carousel Component

A responsive, feature-rich image carousel component for Angular that displays images in a beautiful carousel interface with navigation controls and indicators.

## Features

- ✨ Auto-play functionality with configurable interval
- 🎯 Previous/Next navigation arrows
- 📍 Dot indicators for direct slide navigation
- 📱 Fully responsive design
- ♿ Accessibility support (ARIA labels)
- 🎨 Styled with matching design system colors
- 🔄 Smooth transitions between slides

## Installation

The component is already registered in the `SharedModule`. You can use it anywhere that imports `SharedModule`.

## Usage

### Basic Example

```html
<app-carousel [images]="carouselImages"></app-carousel>
```

### With Configuration

```html
<app-carousel 
  [images]="carouselImages"
  [autoPlay]="true"
  [autoPlayInterval]="5000"
  [showArrows]="true"
  [showIndicators]="true">
</app-carousel>
```

### TypeScript Component

```typescript
import { Component, OnInit } from '@angular/core';
import { CarouselImage } from './carousel/carousel.component';

@Component({
  selector: 'app-my-carousel',
  templateUrl: './my-carousel.component.html'
})
export class MyCarouselComponent implements OnInit {
  carouselImages: CarouselImage[] = [];

  ngOnInit() {
    this.carouselImages = [
      {
        id: '1',
        url: 'assets/images/slide-1.jpg',
        alt: 'First slide'
      },
      {
        id: '2',
        url: 'assets/images/slide-2.jpg',
        alt: 'Second slide'
      },
      {
        id: '3',
        url: 'assets/images/slide-3.jpg',
        alt: 'Third slide'
      }
    ];
  }
}
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `images` | `CarouselImage[]` | `[]` | Array of images to display in carousel |
| `autoPlay` | `boolean` | `true` | Enable automatic slide advancement |
| `autoPlayInterval` | `number` | `5000` | Time between slides in milliseconds (5 seconds) |
| `showArrows` | `boolean` | `true` | Show/hide navigation arrows |
| `showIndicators` | `boolean` | `true` | Show/hide dot indicators |

## CarouselImage Interface

```typescript
interface CarouselImage {
  id: string;        // Unique identifier for the image
  url: string;       // Image URL
  alt?: string;      // Alternative text for accessibility (optional)
}
```

## Component Methods

```typescript
// Move to next slide
next(): void

// Move to previous slide
previous(): void

// Jump to specific slide
goToSlide(index: number): void
```

## Styling

The component uses the design system color scheme:
- **Primary accent**: `#a4f675` (Light Green)
- **Background**: `#1d1c1c` (Dark)
- **Border**: `rgba(255, 255, 255, 0.2)` (Subtle white border)

### Customization

To customize the appearance, override the SCSS variables in your component or global styles:

```scss
// Custom carousel styles
.carousel-wrapper {
  background: your-color;
  border-radius: your-radius;
  // ... other custom styles
}
```

## Responsive Breakpoints

- **Desktop**: Aspect ratio 16:9, max-height 500px, 25px border radius
- **Tablet (≤992px)**: Aspect ratio 4:3, max-height 400px, 20px border radius
- **Mobile (≤480px)**: Aspect ratio 3:2, max-height 300px, 16px border radius

## Accessibility

- ARIA labels for navigation buttons
- Semantic button elements
- Keyboard navigation support
- Alt text support for images

## Example Integration

```html
<!-- In your template -->
<section class="featured-games">
  <h2>Featured Game Winners</h2>
  <app-carousel 
    [images]="winnerImages"
    [autoPlayInterval]="4000">
  </app-carousel>
</section>
```

```typescript
// In your component
export class FeaturedGamesComponent implements OnInit {
  winnerImages: CarouselImage[] = [];

  constructor(private gamesService: GamesService) {}

  ngOnInit() {
    this.loadWinnerImages();
  }

  loadWinnerImages() {
    this.gamesService.getWinnerImages().subscribe(images => {
      this.winnerImages = images.map(img => ({
        id: img.id,
        url: img.imageUrl,
        alt: img.winnerName
      }));
    });
  }
}
```
