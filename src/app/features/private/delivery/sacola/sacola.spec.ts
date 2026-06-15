import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sacola } from './sacola';

describe('Sacola', () => {
  let component: Sacola;
  let fixture: ComponentFixture<Sacola>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sacola],
    }).compileComponents();

    fixture = TestBed.createComponent(Sacola);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
