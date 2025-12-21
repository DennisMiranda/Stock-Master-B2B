import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPayForm } from './checkout-pay-form';

describe('CheckoutPayForm', () => {
  let component: CheckoutPayForm;
  let fixture: ComponentFixture<CheckoutPayForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutPayForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutPayForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
