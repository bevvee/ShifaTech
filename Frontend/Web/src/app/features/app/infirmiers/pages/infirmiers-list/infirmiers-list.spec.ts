import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfirmiersList } from './infirmiers-list';

describe('InfirmiersList', () => {
  let component: InfirmiersList;
  let fixture: ComponentFixture<InfirmiersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfirmiersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfirmiersList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
