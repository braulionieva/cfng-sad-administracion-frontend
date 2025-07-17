import { TestBed } from '@angular/core/testing';

import { ConfiguracionPlazosService } from './configuracion-plazos.service';

describe('ConfiguracionPlazosService', () => {
  let service: ConfiguracionPlazosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiguracionPlazosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
