import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenciarCardapio } from './gerenciar-cardapio';

describe('GerenciarCardapio', () => {
  let component: GerenciarCardapio;
  let fixture: ComponentFixture<GerenciarCardapio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarCardapio],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarCardapio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
