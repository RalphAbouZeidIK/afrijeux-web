import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesPariesPopupComponent } from './mes-paries-popup.component';

describe('MesPariesPopupComponent', () => {
  let component: MesPariesPopupComponent;
  let fixture: ComponentFixture<MesPariesPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesPariesPopupComponent]
    });
    fixture = TestBed.createComponent(MesPariesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
