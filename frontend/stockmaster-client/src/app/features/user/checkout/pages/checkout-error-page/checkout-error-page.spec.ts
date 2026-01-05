import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutErrorPage } from './checkout-error-page';

describe('CheckoutErrorPage', () => {
  let component: CheckoutErrorPage;
  let fixture: ComponentFixture<CheckoutErrorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutErrorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutErrorPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
