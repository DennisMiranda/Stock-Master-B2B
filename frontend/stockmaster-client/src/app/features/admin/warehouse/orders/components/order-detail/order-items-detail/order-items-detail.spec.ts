import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemsDetail } from './order-items-detail';

describe('OrderItemsDetail', () => {
  let component: OrderItemsDetail;
  let fixture: ComponentFixture<OrderItemsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderItemsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderItemsDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
