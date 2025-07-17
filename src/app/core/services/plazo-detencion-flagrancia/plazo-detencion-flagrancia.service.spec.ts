import { TestBed } from '@angular/core/testing';

import { PlazoDetencionFlagranciaService } from './plazo-detencion-flagrancia.service';

describe('PlazoDetencionFlagranciaService', () => {
  let service: PlazoDetencionFlagranciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlazoDetencionFlagranciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
