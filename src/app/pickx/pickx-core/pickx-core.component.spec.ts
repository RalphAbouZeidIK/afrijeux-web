import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickxCoreComponent } from './pickx-core.component';

describe('PickxCoreComponent', () => {
  let component: PickxCoreComponent;
  let fixture: ComponentFixture<PickxCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickxCoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickxCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
