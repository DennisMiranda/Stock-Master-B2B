import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapRouter } from './map-router';

describe('MapRouter', () => {
  let component: MapRouter;
  let fixture: ComponentFixture<MapRouter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapRouter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapRouter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
