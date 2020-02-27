import { TestBed } from '@angular/core/testing';

import { MailService } from '../db/mail/mail.service';

describe('MailService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MailService = TestBed.get(MailService);
    expect(service).toBeTruthy();
  });
});
