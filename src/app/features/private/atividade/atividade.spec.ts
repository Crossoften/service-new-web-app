import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
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
    createdAt: '2026-03-16T10:00:00.000Z', ...overrides,
  };
}
function budget(overrides: Record<string, unknown> = {}) {
  return {
    id: 10, status: 'Responded', service: { id: 3, name: 'Pintura' },
    provider: { id: 9, name: 'Joelson' }, description: 'Pintar', responseValue: '200.00', ...overrides,
  };
}
function pedido(overrides: Record<string, unknown> = {}) {
  return { id: 20, status: 'Preparing', restaurant: { id: 1, name: 'Pizzaria' }, ...overrides };
}

describe('AtividadeComponent (índice por categoria)', () => {
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
    httpMock.expectOne((r) => r.url.endsWith('/works/my-requests')).flush({ works: opts.works ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/budgets')).flush({ budgets: opts.budgets ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/food-orders')).flush({ foodOrders: opts.pedidos ?? [] });
  }

  it('lista só categorias com atividade, com contador de ativos', () => {
    flushAll({ works: [work()], budgets: [budget()], pedidos: [pedido()] });
    const ids = component.categorias.map((c) => c.id);
    expect(ids).toContain('servicos');
    expect(ids).toContain('delivery');
    expect(component.categorias.find((c) => c.id === 'servicos')?.ativos).toBe(2); // 1 work + 1 budget
    expect(component.categorias.find((c) => c.id === 'delivery')?.ativos).toBe(1);
  });

  it('esconde categoria sem atividade (só delivery ativo → só delivery aparece)', () => {
    flushAll({ works: [work({ status: 'Finished' })], budgets: [budget({ status: 'Rejected' })], pedidos: [pedido()] });
    expect(component.categorias.map((c) => c.id)).toEqual(['delivery']);
  });

  it('sem nenhuma atividade → lista vazia', () => {
    flushAll();
    expect(component.categorias.length).toBe(0);
  });

  it('abrir Serviços navega para /servicos/atividade', () => {
    flushAll({ works: [work()] });
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.abrir(component.categorias[0]);
    expect(nav).toHaveBeenCalledWith(['/servicos/atividade']);
  });

  it('tolera falha de uma fonte sem quebrar', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/my-requests')).flush('x', { status: 500, statusText: 'e' });
    httpMock.expectOne((r) => r.url.endsWith('/budgets')).flush({ budgets: [budget()] });
    httpMock.expectOne((r) => r.url.endsWith('/food-orders')).flush({ foodOrders: [] });
    expect(component.carregando).toBe(false);
    expect(component.categorias.find((c) => c.id === 'servicos')?.ativos).toBe(1);
  });
});
