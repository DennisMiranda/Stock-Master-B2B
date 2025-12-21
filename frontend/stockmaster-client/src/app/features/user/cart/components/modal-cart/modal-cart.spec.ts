import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCart } from './modal-cart';

describe('ModalCart', () => {
  let component: ModalCart;
  let fixture: ComponentFixture<ModalCart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
