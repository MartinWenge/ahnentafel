import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsichtDetailComponent } from './ansicht-detail.component';

describe('AnsichtDetailComponent', () => {
  let component: AnsichtDetailComponent;
  let fixture: ComponentFixture<AnsichtDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnsichtDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnsichtDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
