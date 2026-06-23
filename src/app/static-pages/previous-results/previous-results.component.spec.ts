import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousResultsComponent } from './previous-results.component';

describe('PreviousResultsComponent', () => {
  let component: PreviousResultsComponent;
  let fixture: ComponentFixture<PreviousResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have four results', () => {
    expect(component.results.length).toBe(4);
  });

  it('should render result cards', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.result-box');
    expect(cards.length).toBe(4);
    const firstName = cards[0].querySelector('.result-name')?.textContent?.trim();
    expect(firstName).toBe('Pick 2');
  });
});
