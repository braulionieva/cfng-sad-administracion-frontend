import { TestBed } from '@angular/core/testing';

import { ModalNotificationService } from './modal-notification.service';

describe('ModalNotificationService', () => {
  let service: ModalNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
