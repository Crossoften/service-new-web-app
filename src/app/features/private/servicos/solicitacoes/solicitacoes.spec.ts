import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { SolicitacoesComponent } from './solicitacoes';

describe('SolicitacoesComponent', () => {
  let component: SolicitacoesComponent;
  let fixture: ComponentFixture<SolicitacoesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacoesComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacoesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega as solicitações do cliente (GET /works/my-requests)', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/works/my-requests') && r.method === 'GET');
    req.flush({
      works: [
        {
          id: 1, status: 'InProgress', isUnderWarranty: false,
          service: { id: 3, name: 'Reforma' }, budget: { id: 5 },
          requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'Joelson' },
          serviceValue: '350.00', totalValue: '350.00', createdAt: '2026-03-16T10:00:00.000Z',
        },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });

    expect(component.solicitacoes.length).toBe(1);
    expect(component.solicitacoes[0].prestador.nome).toBe('Joelson');
    expect(component.solicitacoes[0].status).toBe('em_andamento');
    expect(component.solicitacoes[0].valorServico).toBe(350);
  });

  it('mapeia Finished sob garantia para em_garantia', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/works/my-requests'));
    req.flush({
      works: [
        {
          id: 2, status: 'Finished', isUnderWarranty: true,
          service: { id: 3, name: 'Reforma' }, budget: { id: 5 },
          requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'Joelson' },
          warrantyExpiresAt: '2026-06-16T23:59:59.000Z', createdAt: '2026-03-16T10:00:00.000Z',
        },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });

    component.tabAtiva = 'em_andamento';
    expect(component.solicitacoesFiltradas.length).toBe(1);
    expect(component.solicitacoes[0].status).toBe('em_garantia');
  });
});
