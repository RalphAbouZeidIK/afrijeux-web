import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutcomesPageComponent } from './outcomes-page.component';

describe('OutcomesPageComponent', () => {
  let component: OutcomesPageComponent;
  let fixture: ComponentFixture<OutcomesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutcomesPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutcomesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
