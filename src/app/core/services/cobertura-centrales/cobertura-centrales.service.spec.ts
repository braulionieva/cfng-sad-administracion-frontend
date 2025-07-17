import { TestBed } from '@angular/core/testing';

import { CoberturaCentralesService } from './cobertura-centrales.service';

describe('CoberturaCentralesService', () => {
  let service: CoberturaCentralesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoberturaCentralesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
