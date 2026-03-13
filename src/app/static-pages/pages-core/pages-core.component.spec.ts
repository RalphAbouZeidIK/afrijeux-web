import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesCoreComponent } from './pages-core.component';

describe('PagesCoreComponent', () => {
  let component: PagesCoreComponent;
  let fixture: ComponentFixture<PagesCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagesCoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagesCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
