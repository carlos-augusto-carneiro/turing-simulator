import { TestBed } from '@angular/core/testing';

import { TuringMachine } from './turing-machine';

describe('TuringMachine', () => {
  let service: TuringMachine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TuringMachine);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
