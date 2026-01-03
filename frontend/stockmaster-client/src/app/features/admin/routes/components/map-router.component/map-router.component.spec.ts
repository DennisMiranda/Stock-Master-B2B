import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapRouterComponent } from './map-router.component';

describe('MapRouterComponent', () => {
  let component: MapRouterComponent;
  let fixture: ComponentFixture<MapRouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapRouterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapRouterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
