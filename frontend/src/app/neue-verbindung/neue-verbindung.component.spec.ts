import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeueVerbindungComponent } from './neue-verbindung.component';

describe('NeueVerbindungComponent', () => {
  let component: NeueVerbindungComponent;
  let fixture: ComponentFixture<NeueVerbindungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NeueVerbindungComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeueVerbindungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
