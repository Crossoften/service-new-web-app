import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AtividadeComponent } from './atividade';

function work(overrides: Record<string, unknown> = {}) {
  return {
    id: 1, status: 'InProgress', isUnderWarranty: false,
    budget: { id: 5 }, service: { id: 3, name: 'Reforma' },
    requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'Joelson' },
    createdAt: '2026-03-16T10:00:00.000Z',
    ...overrides,
  };
}

function budget(overrides: Record<string, unknown> = {}) {
  return {
    id: 10, status: 'Responded',
    service: { id: 3, name: 'Pintura' }, provider: { id: 9, name: 'Joelson' },
    description: 'Pintar sala', responseValue: '200.00',
    ...overrides,
  };
}

function pedido(overrides: Record<string, unknown> = {}) {
  return { id: 20, status: 'Preparing', restaurant: { id: 1, name: 'Pizzaria' }, ...overrides };
}

describe('AtividadeComponent', () => {
  let component: AtividadeComponent;
  let fixture: ComponentFixture<AtividadeComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtividadeComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AtividadeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function flushAll(opts: { works?: unknown[]; budgets?: unknown[]; pedidos?: unknown[] } = {}) {
    httpMock.expectOne((r) => r.url.endsWith('/works/my-requests') && r.method === 'GET')
      .flush({ works: opts.works ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/budgets') && r.method === 'GET')
      .flush({ budgets: opts.budgets ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/food-orders') && r.method === 'GET')
      .flush({ foodOrders: opts.pedidos ?? [] });
  }

  it('agrega orçamentos, solicitações e pedidos numa lista única', () => {
    flushAll({ works: [work()], budgets: [budget()], pedidos: [pedido()] });
    expect(component.itens.length).toBe(3);
    expect(component.itens.some((i) => i.categoria === 'servicos')).toBe(true);
    expect(component.itens.some((i) => i.categoria === 'delivery')).toBe(true);
  });

  it('orçamento Responded vira destaque "responda"; itens em destaque vêm primeiro', () => {
    flushAll({ works: [work()], budgets: [budget({ status: 'Responded' })] });
    expect(component.itens[0].destaque).toBe(true);
    expect(component.itens[0].subtitulo).toContain('responda');
  });

  it('esconde orçamentos terminais (Accepted/Rejected/Cancelled)', () => {
    flushAll({ budgets: [budget({ id: 11, status: 'Accepted' }), budget({ id: 12, status: 'Rejected' })] });
    expect(component.itens.length).toBe(0);
  });

  it('esconde solicitações finalizadas/canceladas', () => {
    flushAll({ works: [work({ id: 2, status: 'Finished', isUnderWarranty: false })] });
    expect(component.itens.length).toBe(0);
  });

  it('acréscimo pendente no orçamento vira destaque', () => {
    flushAll({ budgets: [budget({ status: 'Pending', extraRequestStatus: 'Pending' })] });
    expect(component.itens[0].destaque).toBe(true);
    expect(component.itens[0].subtitulo).toContain('Acréscimo');
  });

  it('filtro por categoria restringe a lista', () => {
    flushAll({ works: [work()], pedidos: [pedido()] });
    component.selecionarFiltro('delivery');
    expect(component.itensFiltrados.every((i) => i.categoria === 'delivery')).toBe(true);
    component.selecionarFiltro('servicos');
    expect(component.itensFiltrados.every((i) => i.categoria === 'servicos')).toBe(true);
    component.selecionarFiltro('todos');
    expect(component.itensFiltrados.length).toBe(2);
  });

  it('tolera falha de uma fonte sem quebrar a tela', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/my-requests')).flush('erro', { status: 500, statusText: 'Err' });
    httpMock.expectOne((r) => r.url.endsWith('/budgets')).flush({ budgets: [budget()] });
    httpMock.expectOne((r) => r.url.endsWith('/food-orders')).flush({ foodOrders: [] });
    expect(component.carregando).toBe(false);
    expect(component.itens.length).toBe(1);
  });
});
