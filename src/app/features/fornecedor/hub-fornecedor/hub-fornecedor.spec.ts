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
    fixture.detectChanges(); // ngOnInit → GET /works + GET /budgets
  });

  afterEach(() => httpMock.verify());

  function flush(opts: { works?: unknown[]; budgets?: unknown[] } = {}) {
    httpMock.expectOne((r) => r.url.endsWith('/works') && r.method === 'GET').flush({ works: opts.works ?? [] });
    httpMock.expectOne((r) => r.url.endsWith('/budgets') && r.method === 'GET').flush({ budgets: opts.budgets ?? [] });
  }

  it('lista as verticais do fornecedor', () => {
    flush();
    expect(component.verticais.length).toBeGreaterThanOrEqual(6);
    const rotas = component.verticais.map((v) => v.rota);
    expect(rotas).toContain('/fornecedor/home');
    expect(rotas).toContain('/fornecedor/servicos');
  });

  it('conta trabalhos aprovados (Work Pending) e orçamentos a responder', () => {
    flush({
      works: [work({ id: 1, status: 'Pending' }), work({ id: 2, status: 'InProgress' })],
      budgets: [
        { id: 10, description: 'x', status: 'Pending', service: { id: 3, name: 'S' }, requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'J' }, createdAt: '' },
      ],
    });
    expect(component.trabalhosAprovados).toBe(1); // só o Pending
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
});
