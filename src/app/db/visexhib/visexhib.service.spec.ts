import { TestBed } from '@angular/core/testing';

import { VisexhibService } from './visexhib.service';

describe('VisexhibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VisexhibService = TestBed.get(VisexhibService);
    expect(service).toBeTruthy();
  });
});
