import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrizeDetailsPageComponent } from './prize-details-page.component';

describe('PrizeDetailsPageComponent', () => {
  let component: PrizeDetailsPageComponent;
  let fixture: ComponentFixture<PrizeDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrizeDetailsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrizeDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
