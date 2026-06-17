import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCardapio } from './add-cardapio';

describe('AddCardapio', () => {
  let component: AddCardapio;
  let fixture: ComponentFixture<AddCardapio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCardapio],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCardapio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
