import { TestBed } from '@angular/core/testing';

import { ContenidoEtapaIntermediaService } from './contenido-etapa-intermedia.service';

describe('ContenidoEtapaIntermediaService', () => {
  let service: ContenidoEtapaIntermediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContenidoEtapaIntermediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
