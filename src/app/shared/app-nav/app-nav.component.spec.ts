import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppNavComponent } from './app-nav.component';

describe('AppNavComponent', () => {
  let component: AppNavComponent;
  let fixture: ComponentFixture<AppNavComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppNavComponent ],
      imports: [ RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppNavComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show navigation when user is logged in', () => {
    component.isLoggedIn = true;
    fixture.detectChanges();
    const navElement = fixture.nativeElement.querySelector('.nav-container');
    expect(navElement).toBeTruthy();
  });

  it('should hide navigation when user is not logged in', () => {
    component.isLoggedIn = false;
    fixture.detectChanges();
    const navElement = fixture.nativeElement.querySelector('.nav-container');
    expect(navElement).toBeFalsy();
  });

  it('should have 3 navigation items', () => {
    component.isLoggedIn = true;
    fixture.detectChanges();
    const navItems = fixture.nativeElement.querySelectorAll('.nav-item');
    expect(navItems.length).toBe(3);
  });

  it('should mark games as active by default', () => {
    component.isLoggedIn = true;
    fixture.detectChanges();
    const activeItem = fixture.nativeElement.querySelector('.nav-item.active .nav-label');
    expect(activeItem.textContent.trim()).toBe('Games');
  });

  it('should navigate when item is clicked', () => {
    component.isLoggedIn = true;
    spyOn(router, 'navigate');
    fixture.detectChanges();

    const navItems = fixture.nativeElement.querySelectorAll('.nav-item');
    navItems[1].click(); // Click Prize Details

    expect(router.navigate).toHaveBeenCalledWith(['/prize-details']);
  });
});
