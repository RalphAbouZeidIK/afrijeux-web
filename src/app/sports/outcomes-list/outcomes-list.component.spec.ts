import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutcomesListComponent } from './outcomes-list.component';

describe('OutcomesListComponent', () => {
  let component: OutcomesListComponent;
  let fixture: ComponentFixture<OutcomesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutcomesListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutcomesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
