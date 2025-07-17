import { TestBed } from '@angular/core/testing';

import { CentralNotificacionesService } from './central-notificaciones.service';

describe('CentralNotificacionesService', () => {
  let service: CentralNotificacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentralNotificacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
