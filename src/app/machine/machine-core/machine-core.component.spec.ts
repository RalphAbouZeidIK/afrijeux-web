import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineCoreComponent } from './machine-core.component';

describe('MachineCoreComponent', () => {
  let component: MachineCoreComponent;
  let fixture: ComponentFixture<MachineCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MachineCoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachineCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
