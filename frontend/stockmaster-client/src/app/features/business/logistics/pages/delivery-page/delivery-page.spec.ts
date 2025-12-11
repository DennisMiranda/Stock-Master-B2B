import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryPage } from './delivery-page';

describe('DeliveryPage', () => {
  let component: DeliveryPage;
  let fixture: ComponentFixture<DeliveryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
