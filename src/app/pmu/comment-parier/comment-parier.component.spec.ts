import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentParierComponent } from './comment-parier.component';

describe('CommentParierComponent', () => {
  let component: CommentParierComponent;
  let fixture: ComponentFixture<CommentParierComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentParierComponent]
    });
    fixture = TestBed.createComponent(CommentParierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
