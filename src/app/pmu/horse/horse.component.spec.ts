import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorseComponent } from './horse.component';

describe('HorseComponent', () => {
  let component: HorseComponent;
  let fixture: ComponentFixture<HorseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HorseComponent]
    });
    fixture = TestBed.createComponent(HorseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
