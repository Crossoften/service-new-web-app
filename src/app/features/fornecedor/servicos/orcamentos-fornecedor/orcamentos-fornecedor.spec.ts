import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { OrcamentosFornecedorComponent } from './orcamentos-fornecedor';

describe('OrcamentosFornecedorComponent', () => {
  let component: OrcamentosFornecedorComponent;
  let fixture: ComponentFixture<OrcamentosFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcamentosFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrcamentosFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega orçamentos recebidos (scope=Received)', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/budgets'));
    expect(req.request.params.get('scope')).toBe('Received');
    req.flush({
      budgets: [
        { id: 1, description: 'Reparo', status: 'Pending', service: { id: 3, name: 'Reforma' }, requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'Joelson' }, createdAt: '' },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.orcamentos.length).toBe(1);
    expect(component.orcamentos[0].cliente).toBe('Ana');
  });
});
