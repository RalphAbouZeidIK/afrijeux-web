import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsHistoryComponent } from './tickets-history.component';

describe('TicketsHistoryComponent', () => {
  let component: TicketsHistoryComponent;
  let fixture: ComponentFixture<TicketsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketsHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
