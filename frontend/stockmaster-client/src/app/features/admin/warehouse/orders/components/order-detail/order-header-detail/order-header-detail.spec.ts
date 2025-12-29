import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderHeaderDetail } from './order-header-detail';

describe('OrderHeaderDetail', () => {
  let component: OrderHeaderDetail;
  let fixture: ComponentFixture<OrderHeaderDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderHeaderDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderHeaderDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
