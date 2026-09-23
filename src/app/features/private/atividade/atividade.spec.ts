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

interface FlushOpts {
  works?: unknown[]; budgets?: unknown[]; pedidos?: unknown[];
  transactions?: unknown[]; rentals?: unknown[]; transportRequests?: unknown[];
  bookings?: unknown[]; applications?: unknown[];
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

  function flushAll(o: FlushOpts = {}) {
    httpMock.expectOne((r) => r.url.endsWith('/works/my-requests')).flush({ works: o.works ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/budgets')).flush({ budgets: o.budgets ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/food-orders')).flush({ foodOrders: o.pedidos ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/commercial-transactions')).flush({ transactions: o.transactions ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/rentals')).flush({ rentals: o.rentals ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/transport-requests')).flush({ transportRequests: o.transportRequests ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/bookings')).flush({ bookings: o.bookings ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/jobs/applications/me')).flush({ applications: o.applications ?? [] });
  }

  it('lista só categorias com atividade, com contador de ativos', () => {
    flushAll({ works: [work()], budgets: [budget()], pedidos: [pedido()] });
    const ids = component.categorias.map((c) => c.id);
    expect(ids).toContain('servicos');
    expect(ids).toContain('delivery');
    expect(component.categorias.find((c) => c.id === 'servicos')?.ativos).toBe(2);
    expect(component.categorias.find((c) => c.id === 'delivery')?.ativos).toBe(1);
    // sem dados nas outras → não aparecem
    expect(ids).not.toContain('aluguel');
  });

  it('inclui aluguel quando há aluguel ativo (Active) e ignora terminal (Returned)', () => {
    flushAll({ rentals: [{ id: 1, status: 'Active' }, { id: 2, status: 'Returned' }] });
    const aluguel = component.categorias.find((c) => c.id === 'aluguel');
    expect(aluguel?.ativos).toBe(1);
  });

  it('conta hospedagem/transporte/compra-venda/empregos ativos', () => {
    flushAll({
      bookings: [{ id: 1, status: 'Confirmed' }, { id: 2, status: 'Cancelled' }],
      transportRequests: [{ id: 1, status: 'InTransit' }],
      transactions: [{ id: 1, status: 'Paid' }, { id: 2, status: 'Completed' }],
      applications: [{ id: 1, status: 'Applied' }, { id: 2, status: 'Rejected' }],
    });
    const c = (id: string) => component.categorias.find((x) => x.id === id)?.ativos;
    expect(c('hospedagem')).toBe(1);
    expect(c('transporte')).toBe(1);
    expect(c('compra-venda')).toBe(1);
    expect(c('empregos')).toBe(1);
  });

  it('sem nenhuma atividade → lista vazia', () => {
    flushAll();
    expect(component.categorias.length).toBe(0);
  });

  it('abrir aluguel navega para /aluguel/meus', () => {
    flushAll({ rentals: [{ id: 1, status: 'Requested' }] });
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.abrir(component.categorias.find((c) => c.id === 'aluguel')!);
    expect(nav).toHaveBeenCalledWith(['/aluguel/meus']);
  });

  it('tolera falha de fontes sem quebrar', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/my-requests')).flush('x', { status: 500, statusText: 'e' });
    httpMock.expectOne((r) => r.url.endsWith('/budgets')).flush({ budgets: [budget()] });
    httpMock.expectOne((r) => r.url.endsWith('/food-orders')).flush('x', { status: 500, statusText: 'e' });
    httpMock.expectOne((r) => r.url.endsWith('/commercial-transactions')).flush('x', { status: 500, statusText: 'e' });
    httpMock.expectOne((r) => r.url.endsWith('/rentals')).flush('x', { status: 500, statusText: 'e' });
    httpMock.expectOne((r) => r.url.endsWith('/transport-requests')).flush('x', { status: 500, statusText: 'e' });
    httpMock.expectOne((r) => r.url.endsWith('/bookings')).flush('x', { status: 500, statusText: 'e' });
    httpMock.expectOne((r) => r.url.endsWith('/jobs/applications/me')).flush('x', { status: 500, statusText: 'e' });
    expect(component.carregando).toBe(false);
    expect(component.categorias.find((c) => c.id === 'servicos')?.ativos).toBe(1);
  });
});
