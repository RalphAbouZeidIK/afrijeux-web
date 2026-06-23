import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCoreComponent } from './user-core.component';

describe('UserCoreComponent', () => {
  let component: UserCoreComponent;
  let fixture: ComponentFixture<UserCoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserCoreComponent]
    });
    fixture = TestBed.createComponent(UserCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
