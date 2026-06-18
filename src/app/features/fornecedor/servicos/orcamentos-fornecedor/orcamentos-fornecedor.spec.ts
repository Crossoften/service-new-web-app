import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentosFornecedor } from './orcamentos-fornecedor';

describe('OrcamentosFornecedor', () => {
  let component: OrcamentosFornecedor;
  let fixture: ComponentFixture<OrcamentosFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcamentosFornecedor],
    }).compileComponents();

    fixture = TestBed.createComponent(OrcamentosFornecedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
