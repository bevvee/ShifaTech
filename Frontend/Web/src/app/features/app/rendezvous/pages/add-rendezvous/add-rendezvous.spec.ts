import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRendezvous } from './add-rendezvous';

describe('AddRendezvous', () => {
  let component: AddRendezvous;
  let fixture: ComponentFixture<AddRendezvous>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRendezvous]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRendezvous);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
