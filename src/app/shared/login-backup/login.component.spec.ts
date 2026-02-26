import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginBackupComponent } from './login.component';

describe('LoginBackupComponent', () => {
  let component: LoginBackupComponent;
  let fixture: ComponentFixture<LoginBackupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginBackupComponent]
    });
    fixture = TestBed.createComponent(LoginBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
