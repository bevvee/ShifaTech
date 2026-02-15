import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdonnancesList } from './ordonnances-list';

describe('OrdonnancesList', () => {
  let component: OrdonnancesList;
  let fixture: ComponentFixture<OrdonnancesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdonnancesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdonnancesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
