import { TestBed } from '@angular/core/testing';

import { RouteOptimizerService } from './route-optimizer.service';

describe('RouteOptimizerService', () => {
  let service: RouteOptimizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteOptimizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
