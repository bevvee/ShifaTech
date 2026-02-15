import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecializationList } from './specialization-list';

describe('SpecializationList', () => {
  let component: SpecializationList;
  let fixture: ComponentFixture<SpecializationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecializationList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecializationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
