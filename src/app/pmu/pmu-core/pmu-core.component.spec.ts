import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmuCoreComponent } from './pmu-core.component';

describe('PmuCoreComponent', () => {
  let component: PmuCoreComponent;
  let fixture: ComponentFixture<PmuCoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PmuCoreComponent]
    });
    fixture = TestBed.createComponent(PmuCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
