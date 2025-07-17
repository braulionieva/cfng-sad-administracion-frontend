import { TestBed } from '@angular/core/testing';

import { ConfigurarMasDeUnaFiscaliaService } from './configurar-mas-de-una-fiscalia.service';

describe('ConfigurarMasDeUnaFiscaliaService', () => {
  let service: ConfigurarMasDeUnaFiscaliaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigurarMasDeUnaFiscaliaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
