import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignRouteModal } from './assign-route-modal';

describe('ComponentsassignRouteModal', () => {
  let component: AssignRouteModal;
  let fixture: ComponentFixture<AssignRouteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignRouteModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignRouteModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
