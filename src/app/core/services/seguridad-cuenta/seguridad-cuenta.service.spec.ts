import { TestBed } from '@angular/core/testing';

import { SeguridadCuentaService } from './seguridad-cuenta.service';

describe('SeguridadCuentaService', () => {
  let service: SeguridadCuentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeguridadCuentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
