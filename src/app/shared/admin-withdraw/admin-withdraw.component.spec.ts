import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWithdrawComponent } from './admin-withdraw.component';

describe('AdminWithdrawComponent', () => {
  let component: AdminWithdrawComponent;
  let fixture: ComponentFixture<AdminWithdrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminWithdrawComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminWithdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
