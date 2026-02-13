import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsChart } from './appointments-chart';

describe('AppointmentsChart', () => {
  let component: AppointmentsChart;
  let fixture: ComponentFixture<AppointmentsChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
