import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroBannerComponent } from './hero-banner.component';

describe('HeroBannerComponent', () => {
  let component: HeroBannerComponent;
  let fixture: ComponentFixture<HeroBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeroBannerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 pick options', () => {
    expect(component.pickOptions.length).toBe(4);
  });

  it('should call onPickClick when button is clicked', () => {
    spyOn(component, 'onPickClick');
    const button = fixture.nativeElement.querySelector('.pick-button');
    button.click();
    expect(component.onPickClick).toHaveBeenCalled();
  });
});
