import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutTotal } from './checkout-total';

describe('CheckoutTotal', () => {
  let component: CheckoutTotal;
  let fixture: ComponentFixture<CheckoutTotal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutTotal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutTotal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
