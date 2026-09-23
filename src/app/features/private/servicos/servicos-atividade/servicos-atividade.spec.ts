import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ServicosAtividadeComponent } from './servicos-atividade';

function work(overrides: Record<string, unknown> = {}) {
  return {
    id: 1, status: 'InProgress', isUnderWarranty: false,
    budget: { id: 5 }, service: { id: 3, name: 'Reforma' },
    requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'Joelson' },
    createdAt: '2026-03-16T10:00:00.000Z', ...overrides,
  };
}
function budget(overrides: Record<string, unknown> = {}) {
  return {
    id: 10, status: 'Responded', service: { id: 3, name: 'Pintura' },
    provider: { id: 9, name: 'Joelson' }, description: 'Pintar', responseValue: '200.00', ...overrides,
  };
}

describe('ServicosAtividadeComponent', () => {
  let component: ServicosAtividadeComponent;
  let fixture: ComponentFixture<ServicosAtividadeComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicosAtividadeComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicosAtividadeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function flush(opts: { works?: unknown[]; budgets?: unknown[] } = {}) {
    httpMock.expectOne((r) => r.url.endsWith('/works/my-requests')).flush({ works: opts.works ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/budgets')).flush({ budgets: opts.budgets ?? [] });
  }

  it('aba Ativos mostra orçamentos/trabalhos em jogo; Histórico mostra terminais', () => {
    flush({
      works: [work({ id: 1, status: 'InProgress' }), work({ id: 2, status: 'Finished' })],
      budgets: [budget({ id: 10, status: 'Responded' }), budget({ id: 11, status: 'Rejected' })],
    });
    // Ativos: 1 work InProgress + 1 budget Responded
    expect(component.aba).toBe('ativos');
    expect(component.itensFiltrados.length).toBe(2);
    // Histórico: 1 work Finished + 1 budget Rejected
    component.selecionarAba('historico');
    expect(component.itensFiltrados.length).toBe(2);
  });

  it('orçamento respondido vira destaque "responda"', () => {
    flush({ budgets: [budget({ status: 'Responded' })] });
    const item = component.itensFiltrados[0];
    expect(item.destaque).toBe(true);
    expect(item.subtitulo).toContain('responda');
  });

  it('card de orçamento navega para aprovar-orcamento', () => {
    flush({ budgets: [budget({ id: 10, status: 'Responded' })] });
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.abrir(component.itensFiltrados[0]);
    expect(nav).toHaveBeenCalledWith(['/servicos/orcamento', 10]);
  });

  it('trabalho em garantia aparece nos Ativos', () => {
    flush({ works: [work({ id: 3, status: 'Finished', isUnderWarranty: true })] });
    expect(component.itensFiltrados.length).toBe(1);
    expect(component.itensFiltrados[0].subtitulo).toContain('garantia');
  });
});
