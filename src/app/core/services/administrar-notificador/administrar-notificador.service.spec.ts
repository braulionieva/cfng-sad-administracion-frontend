import { TestBed } from '@angular/core/testing';

import { AdministrarNotificadorService } from './administrar-notificador.service';

describe('AdministrarNotificadorService', () => {
  let service: AdministrarNotificadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdministrarNotificadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
