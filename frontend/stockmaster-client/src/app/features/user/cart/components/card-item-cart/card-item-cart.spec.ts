import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardItemCart } from './card-item-cart';

describe('CardItemCart', () => {
  let component: CardItemCart;
  let fixture: ComponentFixture<CardItemCart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardItemCart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardItemCart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
