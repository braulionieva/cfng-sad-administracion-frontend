import { TestBed } from '@angular/core/testing';

import { ConfiguracionPlazosCasosService } from './configuracion-plazos-casos.service';

describe('ConfiguracionPlazosCasosService', () => {
  let service: ConfiguracionPlazosCasosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiguracionPlazosCasosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
