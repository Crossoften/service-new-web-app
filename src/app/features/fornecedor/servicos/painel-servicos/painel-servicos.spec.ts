import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { PainelServicosComponent } from './painel-servicos';

function work(overrides: Record<string, unknown> = {}) {
  return {
    id: 1, status: 'InProgress', isUnderWarranty: false,
    budget: { id: 5 }, service: { id: 3, name: 'Reforma' },
    requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'Joelson' },
    createdAt: '2026-03-16T10:00:00.000Z', ...overrides,
  };
}

describe('PainelServicosComponent', () => {
  let component: PainelServicosComponent;
  let fixture: ComponentFixture<PainelServicosComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelServicosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PainelServicosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function flush(opts: { budgets?: unknown[]; works?: unknown[] } = {}) {
    // O componente e a bottom-nav (auto-fetch) disparam /budgets e /works; atende todos.
    httpMock.match((r) => r.url.endsWith('/budgets') && r.method === 'GET')
      .forEach((r) => r.flush({ budgets: opts.budgets ?? [] }));
    httpMock.match((r) => r.url.endsWith('/works') && r.method === 'GET')
      .forEach((r) => r.flush({ works: opts.works ?? [] }));
  }

  it('lista orçamentos a responder (status Pending) e trabalhos ativos', () => {
    flush({
      budgets: [{ id: 10, description: 'Reparo', status: 'Pending', service: { id: 3, name: 'Reforma' }, requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'Joelson' }, createdAt: '' }],
      works: [work(), work({ id: 2, status: 'Finished' })],
    });
    expect(component.orcamentosPendentes.length).toBe(1);
    // Só o InProgress conta como ativo (o Finished sem garantia sai).
    expect(component.trabalhosAtivos.length).toBe(1);
    expect(component.trabalhosAtivos[0].id).toBe(1);
  });

  it('navega para o detalhe do orçamento ao abrir', () => {
    flush({ budgets: [{ id: 10, description: 'x', status: 'Pending', service: { id: 3, name: 'S' }, requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'J' }, createdAt: '' }] });
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.abrirOrcamento(component.orcamentosPendentes[0]);
    expect(nav).toHaveBeenCalledWith(['/fornecedor/servicos/orcamento', 10]);
  });

  it('leva ao catálogo (meus serviços)', () => {
    flush();
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.irMeusServicos();
    expect(nav).toHaveBeenCalledWith(['/fornecedor/servicos/meus']);
  });
});
