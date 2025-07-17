import { TestBed } from '@angular/core/testing';

import { AdministrarDependenciaService } from './administrar-dependencia.service';

describe('AdministrarDependenciaService', () => {
  let service: AdministrarDependenciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdministrarDependenciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
