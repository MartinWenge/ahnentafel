import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KorrekturPersonComponent } from './korrektur-person.component';

describe('KorrekturPersonComponent', () => {
  let component: KorrekturPersonComponent;
  let fixture: ComponentFixture<KorrekturPersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KorrekturPersonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KorrekturPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
