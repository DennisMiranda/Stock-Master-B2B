import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterDetails } from './router-details';

describe('RouterDetails', () => {
  let component: RouterDetails;
  let fixture: ComponentFixture<RouterDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouterDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
