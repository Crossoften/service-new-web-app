import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { WorkService } from './work';

function baseWork(over: Record<string, unknown> = {}) {
  return {
    id: 1,
    status: 'InProgress',
    isUnderWarranty: false,
    isWarranty: false,
    service: { id: 3, name: 'Reforma' },
    provider: { id: 9, name: 'Joelson' },
    requester: { id: 2, name: 'Ana' },
    files: [],
    createdAt: '2026-03-16T10:00:00.000Z',
    updatedAt: '2026-03-16T10:00:00.000Z',
    ...over,
  };
}

describe('WorkService — garantia (BE-W1)', () => {
  let service: WorkService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WorkService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lista do fornecedor: marca reparo (isWarranty) e o trabalho original', () => {
    let recebido: unknown;
    service.trabalhos().subscribe((r) => (recebido = r));
    httpMock
      .expectOne((r) => r.url.endsWith('/works'))
      .flush({ works: [baseWork({ id: 20, isWarranty: true, parentWorkId: 7 })] });

    const [t] = recebido as { ehGarantia: boolean; trabalhoOriginalId?: number; reparos: unknown[] }[];
    expect(t.ehGarantia).toBe(true);
    expect(t.trabalhoOriginalId).toBe(7);
    expect(t.reparos).toEqual([]);
  });

  it('detalhe do fornecedor: expõe os reparos abertos (warrantyWorks)', () => {
    let recebido: unknown;
    service.trabalho(7).subscribe((r) => (recebido = r));
    httpMock
      .expectOne((r) => r.url.endsWith('/works/7'))
      .flush(baseWork({ id: 7, warrantyWorks: [{ id: 20, status: 'InProgress' }] }));

    const t = recebido as { ehGarantia: boolean; reparos: { id: number; status: string }[] };
    expect(t.ehGarantia).toBe(false);
    expect(t.reparos).toEqual([{ id: 20, status: 'InProgress' }]);
  });

  it('lista do cliente: marca reparo e original', () => {
    let recebido: unknown;
    service.minhasSolicitacoes().subscribe((r) => (recebido = r));
    httpMock
      .expectOne((r) => r.url.endsWith('/works/my-requests'))
      .flush({ works: [baseWork({ id: 20, isWarranty: true, parentWorkId: 7 })] });

    const [s] = recebido as { ehGarantia: boolean; trabalhoOriginalId?: number }[];
    expect(s.ehGarantia).toBe(true);
    expect(s.trabalhoOriginalId).toBe(7);
  });

  it('detalhe do cliente: expõe reparos e tolera trabalho comum', () => {
    let recebido: unknown;
    service.solicitacao(7).subscribe((r) => (recebido = r));
    httpMock
      .expectOne((r) => r.url.endsWith('/works/7'))
      .flush(baseWork({ id: 7, warrantyWorks: [{ id: 20, status: 'Finished' }] }));

    const s = recebido as { ehGarantia: boolean; reparos: { id: number; status: string }[] };
    expect(s.ehGarantia).toBe(false);
    expect(s.reparos).toEqual([{ id: 20, status: 'Finished' }]);
  });

  it('trabalho comum sem campos de garantia: ehGarantia false e reparos vazio', () => {
    let recebido: unknown;
    service.trabalho(1).subscribe((r) => (recebido = r));
    httpMock.expectOne((r) => r.url.endsWith('/works/1')).flush(baseWork());

    const t = recebido as { ehGarantia: boolean; trabalhoOriginalId?: number; reparos: unknown[] };
    expect(t.ehGarantia).toBe(false);
    expect(t.trabalhoOriginalId).toBeUndefined();
    expect(t.reparos).toEqual([]);
  });
});
