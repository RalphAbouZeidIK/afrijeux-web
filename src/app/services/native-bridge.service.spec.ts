import { TestBed } from '@angular/core/testing';

import { NativeBridgeService } from './native-bridge.service';

describe('NativeBridgeService', () => {
  let service: NativeBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NativeBridgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
