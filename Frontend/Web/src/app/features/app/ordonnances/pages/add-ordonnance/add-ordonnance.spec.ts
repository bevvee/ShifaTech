import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrdonnance } from './add-ordonnance';

describe('AddOrdonnance', () => {
  let component: AddOrdonnance;
  let fixture: ComponentFixture<AddOrdonnance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOrdonnance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOrdonnance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
