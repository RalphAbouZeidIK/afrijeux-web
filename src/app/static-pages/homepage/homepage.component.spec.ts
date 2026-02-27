import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageComponent } from './homepage.component';

describe('HomepageComponent', () => {
  let component: HomepageComponent;
  let fixture: ComponentFixture<HomepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomepageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have four games defined', () => {
    expect(component.games.length).toBe(4);
  });

  it('game cards should render with prize and play button', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.game-card');
    expect(cards.length).toBe(4);
    const firstPrize = cards[0].querySelector('.prize-amount')?.textContent?.trim();
    expect(firstPrize).toBe('₦3.65M');
    const firstLabel = cards[0].querySelector('.game-label')?.textContent?.trim();
    expect(firstLabel).toBe('Today');
    const button = cards[0].querySelector('.play-now-btn');
    expect(button).toBeTruthy();
  });
});
