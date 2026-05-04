import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapidGamesComponent } from './rapid-games.component';

describe('RapidGamesComponent', () => {
  let component: RapidGamesComponent;
  let fixture: ComponentFixture<RapidGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapidGamesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapidGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
