import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanceledBetsComponent } from './canceled-bets.component';

describe('CanceledBetsComponent', () => {
  let component: CanceledBetsComponent;
  let fixture: ComponentFixture<CanceledBetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanceledBetsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanceledBetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
