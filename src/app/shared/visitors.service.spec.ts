import { TestBed } from '@angular/core/testing';

import { VisitorsService } from '../db/visitors/visitors.service';

describe('VisitorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VisitorsService = TestBed.get(VisitorsService);
    expect(service).toBeTruthy();
  });
});
