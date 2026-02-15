import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInfirmier } from './add-infirmier';

describe('AddInfirmier', () => {
  let component: AddInfirmier;
  let fixture: ComponentFixture<AddInfirmier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInfirmier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInfirmier);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
