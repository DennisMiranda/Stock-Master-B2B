import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRouteModal } from './create-route-modal';

describe('CreateRouteModal', () => {
  let component: CreateRouteModal;
  let fixture: ComponentFixture<CreateRouteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRouteModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRouteModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
