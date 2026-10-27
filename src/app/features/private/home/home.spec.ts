import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { HomeComponent } from './home';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // ngOnInit → /profile/me + /food-orders + /works/my-requests + /budgets
  });

  /** Flush das 4 chamadas do ngOnInit (perfil, delivery, solicitações, orçamentos). */
  function flushInit(opts: {
    nome?: string;
    foodOrders?: unknown[];
    works?: unknown[];
    budgets?: unknown[];
    bookings?: unknown[];
    rentals?: unknown[];
    transportRequests?: unknown[];
    commercial?: unknown[];
  } = {}) {
    httpMock.expectOne((r) => r.url.endsWith('/profile/me')).flush({ id: 1, name: opts.nome ?? 'Ana' });
    httpMock.expectOne((r) => r.url.endsWith('/food-orders')).flush({ foodOrders: opts.foodOrders ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/works/my-requests')).flush({ works: opts.works ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/budgets')).flush({ budgets: opts.budgets ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/bookings')).flush({ bookings: opts.bookings ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/rentals')).flush({ rentals: opts.rentals ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/transport-requests')).flush({ transportRequests: opts.transportRequests ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/commercial-transactions')).flush({ transactions: opts.commercial ?? [] });
  }

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

  it('should create', () => {
    flushInit();
    expect(component).toBeTruthy();
  });

  it('mostra o nome real do cliente e a inicial (sem mock)', () => {
    flushInit({ nome: 'Ana Souza' });
    expect(component.nomeExibicao).toBe('Ana Souza');
    expect(component.inicial).toBe('A');
  });

  it('destaca apenas pedidos em andamento (não entregues/cancelados)', () => {
    flushInit({
      foodOrders: [
        { id: 1, status: 'OnTheWay', restaurant: { id: 2, name: 'Cantina' } },
        { id: 2, status: 'Delivered', restaurant: { id: 3, name: 'X' } },
        { id: 3, status: 'Cancelled', restaurant: { id: 4, name: 'Y' } },
      ],
    });
    expect(component.pedidosAtivos.map((p) => p.id)).toEqual([1]);
    expect(component.pedidoAtivo?.id).toBe(1);
  });

  it('resume serviços em andamento e destaca orçamento respondido (fatia 2)', () => {
    flushInit({ works: [work()], budgets: [budget({ status: 'Responded' })] });
    expect(component.servicosAtivos).toBe(2);
    expect(component.servicoResumo?.destaque).toBe(true);
    expect(component.servicoResumo?.subtitulo).toContain('responda');
  });

  it('sem serviços ativos, não mostra o card', () => {
    flushInit({ works: [work({ status: 'Finished' })], budgets: [budget({ status: 'Rejected' })] });
    expect(component.servicosAtivos).toBe(0);
    expect(component.servicoResumo).toBeUndefined();
  });

  it('mostra hospedagem em andamento (reserva solicitada) e ignora as recusadas', () => {
    flushInit({
      bookings: [
        { id: 1, status: 'Requested', accommodation: { id: 2, name: 'Casa da Praia' } },
        { id: 2, status: 'Rejected', accommodation: { id: 3, name: 'Chalé' } },
      ],
    });
    const hosp = component.atividades.find((a) => a.categoria === 'Hospedagem');
    expect(hosp).toBeTruthy();
    expect(hosp!.titulo).toBe('Reserva em andamento');
    expect(hosp!.subtitulo).toBe('Casa da Praia');
    expect(hosp!.rota).toBe('/hospedagem/reservas');
    expect(component.atividades.length).toBe(1); // só a hospedagem ativa; recusada não entra
  });
});
