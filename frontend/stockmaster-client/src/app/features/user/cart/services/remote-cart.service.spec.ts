import { TestBed } from '@angular/core/testing';

import { RemoteCartService } from './remote-cart.service';

describe('RemoteCartService', () => {
  let service: RemoteCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteCartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
