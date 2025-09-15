import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OddItemComponent } from './odd-item.component';

describe('OddItemComponent', () => {
  let component: OddItemComponent;
  let fixture: ComponentFixture<OddItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OddItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OddItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
