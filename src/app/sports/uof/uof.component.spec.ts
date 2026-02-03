import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UofComponent } from './uof.component';

describe('UofComponent', () => {
  let component: UofComponent;
  let fixture: ComponentFixture<UofComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UofComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
