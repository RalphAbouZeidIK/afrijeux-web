import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayResponsiblyComponent } from './play-responsibly.component';

describe('PlayResponsiblyComponent', () => {
  let component: PlayResponsiblyComponent;
  let fixture: ComponentFixture<PlayResponsiblyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayResponsiblyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayResponsiblyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
