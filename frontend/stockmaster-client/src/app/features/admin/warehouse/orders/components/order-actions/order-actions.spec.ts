import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderActions } from './order-actions';

describe('OrderActions', () => {
  let component: OrderActions;
  let fixture: ComponentFixture<OrderActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderActions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
