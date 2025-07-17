import { TestBed } from '@angular/core/testing';

import { AdministrarPlazosService } from './administrar-plazos.service';

describe('AdministrarPlazosService', () => {
  let service: AdministrarPlazosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdministrarPlazosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
