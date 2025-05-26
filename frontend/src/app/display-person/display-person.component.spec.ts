import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPersonComponent } from './display-person.component';

describe('DisplayPersonComponent', () => {
  let component: DisplayPersonComponent;
  let fixture: ComponentFixture<DisplayPersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisplayPersonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
