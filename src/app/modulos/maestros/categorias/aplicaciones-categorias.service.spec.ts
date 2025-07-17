import { TestBed } from '@angular/core/testing';

import { AplicacionesCategoriasService } from './aplicaciones-categorias.service';

describe('AplicacionesCategoriasService', () => {
  let service: AplicacionesCategoriasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AplicacionesCategoriasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
