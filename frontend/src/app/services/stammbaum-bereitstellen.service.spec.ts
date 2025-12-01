import { TestBed } from '@angular/core/testing';

import { StammbaumBereitstellenService } from './stammbaum-bereitstellen.service';

describe('StammbaumBereitstellenService', () => {
  let service: StammbaumBereitstellenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StammbaumBereitstellenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
