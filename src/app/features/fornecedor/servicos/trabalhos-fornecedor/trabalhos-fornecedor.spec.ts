import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { TrabalhosFornecedorComponent } from './trabalhos-fornecedor';

describe('TrabalhosFornecedorComponent', () => {
  let component: TrabalhosFornecedorComponent;
  let fixture: ComponentFixture<TrabalhosFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrabalhosFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TrabalhosFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega os trabalhos recebidos (scope=Received)', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/works') && r.method === 'GET');
    expect(req.request.params.get('scope')).toBe('Received');
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

    expect(component.trabalhos.length).toBe(1);
    expect(component.trabalhos[0].cliente).toBe('Ana');
    expect(component.trabalhos[0].status).toBe('em_andamento');
    expect(component.trabalhos[0].ehGarantia).toBe(false);
  });

  it('marca o reparo de garantia (isWarranty) na lista', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works') && r.method === 'GET').flush({
      works: [
        {
          id: 20, status: 'Pending', isUnderWarranty: false, isWarranty: true, parentWorkId: 7,
          service: { id: 3, name: 'Reforma' },
          requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'Joelson' },
          createdAt: '2026-03-16T10:00:00.000Z',
        },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.trabalhos[0].ehGarantia).toBe(true);
    expect(component.trabalhos[0].trabalhoOriginalId).toBe(7);
  });
});
