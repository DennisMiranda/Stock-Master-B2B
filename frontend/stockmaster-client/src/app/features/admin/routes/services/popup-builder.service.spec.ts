import { TestBed } from '@angular/core/testing';

import { PopupBuilderService } from './popup-builder.service';

describe('PopupBuilderService', () => {
  let service: PopupBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopupBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
