import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { PagamentoServicoComponent } from './pagamento-servico';

describe('PagamentoServicoComponent', () => {
  let component: PagamentoServicoComponent;
  let fixture: ComponentFixture<PagamentoServicoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagamentoServicoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PagamentoServicoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush({
      id: 1, status: 'Finished', isUnderWarranty: false,
      budgetId: 5, budget: { id: 5 }, serviceId: 3, service: { id: 3, name: 'Reforma' },
      requesterId: 2, requester: { id: 2, name: 'Ana' }, providerId: 9, provider: { id: 9, name: 'Joelson' },
      serviceValue: '350.00', totalValue: '350.00', files: [],
      createdAt: '2026-03-16T10:00:00.000Z', updatedAt: '2026-03-16T10:00:00.000Z',
    });
  });

  afterEach(() => httpMock.verify());

  it('paga com PIX (POST /works/1/pay method=Pix)', () => {
    component.selecionarForma('pix');
    component.efetuarPagamento();
    const req = httpMock.expectOne((r) => r.url.endsWith('/works/1/pay') && r.method === 'POST');
    expect(req.request.body.method).toBe('Pix');
    req.flush({ id: 1, status: 'Finished' });
  });

  it('mapeia "dinheiro" para BankSlip', () => {
    component.selecionarForma('dinheiro');
    component.efetuarPagamento();
    const req = httpMock.expectOne((r) => r.url.endsWith('/works/1/pay') && r.method === 'POST');
    expect(req.request.body.method).toBe('BankSlip');
    req.flush({ id: 1 });
  });
});
