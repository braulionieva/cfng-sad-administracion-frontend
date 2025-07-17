import { TestBed } from '@angular/core/testing';

import { AdministrarDependenciasATFService } from './administrar-dependencias-atf.service';

describe('AdministrarDependenciasATFService', () => {
  let service: AdministrarDependenciasATFService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdministrarDependenciasATFService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
