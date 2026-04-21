import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselComponent } from './carousel.component';

describe('CarouselComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarouselComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to next slide', () => {
    component.images = [
      { id: '1', url: 'url1.jpg' },
      { id: '2', url: 'url2.jpg' },
      { id: '3', url: 'url3.jpg' }
    ];
    component.currentIndex = 0;
    component.next();
    expect(component.currentIndex).toBe(1);
  });

  it('should navigate to previous slide', () => {
    component.images = [
      { id: '1', url: 'url1.jpg' },
      { id: '2', url: 'url2.jpg' },
      { id: '3', url: 'url3.jpg' }
    ];
    component.currentIndex = 1;
    component.previous();
    expect(component.currentIndex).toBe(0);
  });

  it('should wrap around on next at end', () => {
    component.images = [
      { id: '1', url: 'url1.jpg' },
      { id: '2', url: 'url2.jpg' }
    ];
    component.currentIndex = 1;
    component.next();
    expect(component.currentIndex).toBe(0);
  });

  it('should go to specific slide', () => {
    component.images = [
      { id: '1', url: 'url1.jpg' },
      { id: '2', url: 'url2.jpg' },
      { id: '3', url: 'url3.jpg' }
    ];
    component.goToSlide(2);
    expect(component.currentIndex).toBe(2);
  });
});
