import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { HubFornecedorComponent } from './hub-fornecedor';

function work(overrides: Record<string, unknown> = {}) {
  return {
    id: 1, status: 'Pending', isUnderWarranty: false,
    budget: { id: 5 }, service: { id: 3, name: 'Reforma' },
    requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'Joelson' },
    createdAt: '2026-03-16T10:00:00.000Z', ...overrides,
  };
}

describe('HubFornecedorComponent', () => {
  let component: HubFornecedorComponent;
  let fixture: ComponentFixture<HubFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HubFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HubFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    // Intro de planos já vista por padrão: os testes gerais não disparam o catálogo.
    try { localStorage.setItem('service:assinatura-intro-vista', '1'); } catch { /* ok */ }
    fixture.detectChanges(); // ngOnInit → GET /works + GET /budgets
  });

  afterEach(() => {
    httpMock.verify();
    try { localStorage.removeItem('service:assinatura-intro-vista'); } catch { /* ok */ }
  });

  function flush(opts: {
    works?: unknown[];
    budgets?: unknown[];
    bookings?: unknown[];
    rentals?: unknown[];
    transportRequests?: unknown[];
    commercial?: unknown[];
  } = {}) {
    httpMock.expectOne((r) => r.url.endsWith('/works') && r.method === 'GET').flush({ works: opts.works ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/budgets') && r.method === 'GET').flush({ budgets: opts.budgets ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/bookings') && r.method === 'GET').flush({ bookings: opts.bookings ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/rentals') && r.method === 'GET').flush({ rentals: opts.rentals ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/transport-requests') && r.method === 'GET').flush({ transportRequests: opts.transportRequests ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/commercial-transactions') && r.method === 'GET').flush({ transactions: opts.commercial ?? [] });
  }

  it('lista as verticais do fornecedor', () => {
    flush();
    expect(component.verticais.length).toBeGreaterThanOrEqual(6);
    const rotas = component.verticais.map((v) => v.rota);
    expect(rotas).toContain('/fornecedor/home');
    expect(rotas).toContain('/fornecedor/servicos');
  });

  it('conta trabalhos ativos (Pending + InProgress) e orçamentos a responder', () => {
    flush({
      works: [
        work({ id: 1, status: 'Pending' }),
        work({ id: 2, status: 'InProgress' }),
        work({ id: 3, status: 'Finished' }),
        work({ id: 4, status: 'Cancelled' }),
      ],
      budgets: [
        { id: 10, description: 'x', status: 'Pending', service: { id: 3, name: 'S' }, requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'J' }, createdAt: '' },
      ],
    });
    expect(component.trabalhosAtivos).toBe(2); // Pending + InProgress; terminais fora
    expect(component.orcamentosPendentes).toBe(1);
  });

  it('card de trabalho aprovado leva a Trabalhos', () => {
    flush({ works: [work({ status: 'Pending' })] });
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.irTrabalhos();
    expect(nav).toHaveBeenCalledWith(['/fornecedor/servicos/trabalhos']);
  });

  it('card de orçamentos leva a Orçamentos', () => {
    flush();
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.irOrcamentos();
    expect(nav).toHaveBeenCalledWith(['/fornecedor/servicos/orcamentos']);
  });

  it('abrir() navega para a rota da vertical', () => {
    flush();
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.abrir(component.verticais[0]);
    expect(nav).toHaveBeenCalledWith([component.verticais[0].rota]);
  });

  it('irPerfil() navega para o perfil do fornecedor', () => {
    flush();
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.irPerfil();
    expect(nav).toHaveBeenCalledWith(['/fornecedor/perfil']);
  });

  it('irMensagens() leva ao inbox de conversas (BE-Q5)', () => {
    flush();
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.irMensagens();
    expect(nav).toHaveBeenCalledWith(['/mensagens']);
  });

  it('primeiro acesso sem assinatura → abre os planos (?novo=1)', () => {
    flush(); // init padrão do componente do beforeEach
    try { localStorage.removeItem('service:assinatura-intro-vista'); } catch { /* ok */ }
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component['apresentarPlanosNoPrimeiroAcesso']();
    httpMock.expectOne((r) => r.url.endsWith('/subscriptions/catalog')).flush({
      plans: [], categories: [{ id: 3, name: 'Serviços', slug: 's', isSubscribed: false }], subscribedCount: 0,
    });
    expect(nav).toHaveBeenCalledWith(['/fornecedor/assinatura'], { queryParams: { novo: 1 } });
  });

  it('já com alguma assinatura → não abre os planos', () => {
    flush();
    try { localStorage.removeItem('service:assinatura-intro-vista'); } catch { /* ok */ }
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component['apresentarPlanosNoPrimeiroAcesso']();
    httpMock.expectOne((r) => r.url.endsWith('/subscriptions/catalog')).flush({
      plans: [], categories: [{ id: 3, name: 'Serviços', slug: 's', isSubscribed: true }], subscribedCount: 1,
    });
    expect(nav).not.toHaveBeenCalledWith(['/fornecedor/assinatura'], { queryParams: { novo: 1 } });
  });

  it('mostra pedidos recebidos em andamento (hospedagem) e ignora cancelados', () => {
    flush({
      bookings: [
        { id: 1, status: 'Requested', accommodation: { id: 2, name: 'Pousada do Sol' } },
        { id: 2, status: 'Cancelled', accommodation: { id: 3, name: 'Chalé' } },
      ],
    });
    const hosp = component.atividades.find((a) => a.categoria === 'Hospedagem');
    expect(hosp).toBeTruthy();
    expect(hosp!.titulo).toBe('Reserva em andamento');
    expect(hosp!.subtitulo).toBe('Pousada do Sol');
    expect(component.atividades.length).toBe(1);
  });
});
