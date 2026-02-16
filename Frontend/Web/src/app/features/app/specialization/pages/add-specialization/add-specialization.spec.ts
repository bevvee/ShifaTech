import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSpecialization } from './add-specialization';

describe('AddSpecialization', () => {
  let component: AddSpecialization;
  let fixture: ComponentFixture<AddSpecialization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSpecialization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSpecialization);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
