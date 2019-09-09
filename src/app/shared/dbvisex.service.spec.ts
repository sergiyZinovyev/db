import { TestBed } from '@angular/core/testing';

import { DbvisexService } from './dbvisex.service';

describe('DbvisexService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DbvisexService = TestBed.get(DbvisexService);
    expect(service).toBeTruthy();
  });
});
