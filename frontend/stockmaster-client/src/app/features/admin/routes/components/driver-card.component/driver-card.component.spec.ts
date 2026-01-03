import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverCardComponent } from './driver-card.component';

describe('DriverCardComponent', () => {
  let component: DriverCardComponent;
  let fixture: ComponentFixture<DriverCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
