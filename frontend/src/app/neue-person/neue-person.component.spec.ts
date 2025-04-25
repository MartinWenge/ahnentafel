import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeuePersonComponent } from './neue-person.component';

describe('NeuePersonComponent', () => {
  let component: NeuePersonComponent;
  let fixture: ComponentFixture<NeuePersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NeuePersonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeuePersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
