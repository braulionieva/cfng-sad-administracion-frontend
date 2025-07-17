import { TestBed } from '@angular/core/testing';

import { DataBrowserService } from './data-browser.service';

describe('DataBrowserService', () => {
  let service: DataBrowserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataBrowserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
