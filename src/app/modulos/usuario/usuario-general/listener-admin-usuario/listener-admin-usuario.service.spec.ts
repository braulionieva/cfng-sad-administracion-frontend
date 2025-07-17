import { TestBed } from '@angular/core/testing';

import { ListenerAdminUsuarioService } from './listener-admin-usuario.service';

describe('ListenerAdminUsuarioService', () => {
  let service: ListenerAdminUsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListenerAdminUsuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
