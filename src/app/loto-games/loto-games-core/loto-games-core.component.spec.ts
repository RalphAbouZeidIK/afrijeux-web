import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotoGamesCoreComponent } from './loto-games-core.component';

describe('LotoGamesCoreComponent', () => {
  let component: LotoGamesCoreComponent;
  let fixture: ComponentFixture<LotoGamesCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotoGamesCoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotoGamesCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
