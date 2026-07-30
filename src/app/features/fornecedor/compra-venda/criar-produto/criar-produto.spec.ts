import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriarProduto } from './criar-produto';

describe('CriarProduto', () => {
  let component: CriarProduto;
  let fixture: ComponentFixture<CriarProduto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarProduto],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarProduto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
