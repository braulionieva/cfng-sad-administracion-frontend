import { TestBed } from '@angular/core/testing';

import { AgregarDependenciaUsService } from './agregar-dependencia-us.service';

describe('AgregarDependenciaUsService', () => {
  let service: AgregarDependenciaUsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgregarDependenciaUsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
