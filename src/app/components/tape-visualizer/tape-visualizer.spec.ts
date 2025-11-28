import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TapeVisualizer } from './tape-visualizer';

describe('TapeVisualizer', () => {
  let component: TapeVisualizer;
  let fixture: ComponentFixture<TapeVisualizer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TapeVisualizer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TapeVisualizer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
