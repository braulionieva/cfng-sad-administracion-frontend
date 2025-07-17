import { TestBed } from '@angular/core/testing';

import { PlazoDocObsService } from './plazo-doc-obs.service';

describe('PlazoDocObsService', () => {
  let service: PlazoDocObsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlazoDocObsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
