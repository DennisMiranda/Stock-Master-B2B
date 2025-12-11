import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryMap } from './delivery-map';

describe('DeliveryMap', () => {
  let component: DeliveryMap;
  let fixture: ComponentFixture<DeliveryMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
