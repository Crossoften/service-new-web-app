import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { BudgetService } from './budget';

function budget(over: Record<string, unknown> = {}) {
  return {
    id: 9, status: 'Responded', responseValue: '200.00',
    service: { id: 3, name: 'Pintura' },
    requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'Joelson' },
    files: [], createdAt: '2026-03-16T10:00:00.000Z', updatedAt: '2026-03-16T10:00:00.000Z',
    ...over,
  };
}

describe('BudgetService — chat do orçamento (BE-CHAT-1)', () => {
  let service: BudgetService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BudgetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('detalhe (cliente) expõe chatId', () => {
    let vm: unknown;
    service.orcamento(9).subscribe((o) => (vm = o));
    httpMock.expectOne((r) => r.url.endsWith('/budgets/9')).flush(budget({ chat: { id: 55 } }));
    expect((vm as { chatId?: number }).chatId).toBe(55);
  });

  it('lista (cliente) expõe chatId', () => {
    let vm: unknown;
    service.meus().subscribe((l) => (vm = l));
    httpMock.expectOne((r) => r.url.endsWith('/budgets')).flush({ budgets: [budget({ chat: { id: 55 } })] });
    expect((vm as { chatId?: number }[])[0].chatId).toBe(55);
  });

  it('detalhe (fornecedor) expõe chatId', () => {
    let vm: unknown;
    service.orcamentoFornecedor(9).subscribe((o) => (vm = o));
    httpMock.expectOne((r) => r.url.endsWith('/budgets/9')).flush(budget({ chat: { id: 55 } }));
    expect((vm as { chatId?: number }).chatId).toBe(55);
  });

  it('lista (fornecedor) expõe chatId', () => {
    let vm: unknown;
    service.recebidos().subscribe((l) => (vm = l));
    httpMock.expectOne((r) => r.url.endsWith('/budgets')).flush({ budgets: [budget({ chat: { id: 55 } })] });
    expect((vm as { chatId?: number }[])[0].chatId).toBe(55);
  });

  it('orçamento antigo sem chat → chatId indefinido (botão fica escondido)', () => {
    let vm: unknown;
    service.orcamento(9).subscribe((o) => (vm = o));
    httpMock.expectOne((r) => r.url.endsWith('/budgets/9')).flush(budget());
    expect((vm as { chatId?: number }).chatId).toBeUndefined();
  });
});
