import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutCustomerForm } from './checkout-customer-form';

describe('CheckoutCustomerForm', () => {
  let component: CheckoutCustomerForm;
  let fixture: ComponentFixture<CheckoutCustomerForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutCustomerForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutCustomerForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
