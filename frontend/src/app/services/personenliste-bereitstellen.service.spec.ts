import { TestBed } from '@angular/core/testing';

import { PersonenlisteBereitstellenService } from './personenliste-bereitstellen.service';

describe('PersonenlisteBereitstellenService', () => {
  let service: PersonenlisteBereitstellenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonenlisteBereitstellenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
