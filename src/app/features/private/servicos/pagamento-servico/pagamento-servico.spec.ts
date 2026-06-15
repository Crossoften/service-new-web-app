import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagamentoServico } from './pagamento-servico';

describe('PagamentoServico', () => {
  let component: PagamentoServico;
  let fixture: ComponentFixture<PagamentoServico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagamentoServico],
    }).compileComponents();

    fixture = TestBed.createComponent(PagamentoServico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
