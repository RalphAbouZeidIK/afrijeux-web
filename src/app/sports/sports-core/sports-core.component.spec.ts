import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportsCoreComponent } from './sports-core.component';

describe('SportsCoreComponent', () => {
  let component: SportsCoreComponent;
  let fixture: ComponentFixture<SportsCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SportsCoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SportsCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
