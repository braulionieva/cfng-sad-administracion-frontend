import { TestBed } from '@angular/core/testing';

import { PerfilesUsuarioService } from './perfiles-usuario.service';

describe('PerfilesUsuarioService', () => {
  let service: PerfilesUsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerfilesUsuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
