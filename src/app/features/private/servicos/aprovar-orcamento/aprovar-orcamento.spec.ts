import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AprovarOrcamentoComponent } from './aprovar-orcamento';

describe('AprovarOrcamentoComponent', () => {
  let component: AprovarOrcamentoComponent;
  let fixture: ComponentFixture<AprovarOrcamentoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprovarOrcamentoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AprovarOrcamentoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/budgets/1')).flush({
      id: 1, description: 'Reparo', status: 'Responded', responseDescription: 'Posso fazer', responseValue: '350.00',
      responseTimeQuantity: 3, responseTimeUnit: 'Day', serviceId: 3, service: { id: 3, name: 'Reforma' },
      requesterId: 2, requester: { id: 2, name: 'Ana' }, providerId: 9, provider: { id: 9, name: 'Joelson' },
      files: [], createdAt: '2026-01-01T10:00:00Z', updatedAt: '',
    });
  });

  afterEach(() => httpMock.verify());

  it('carrega e mapeia o orçamento', () => {
    expect(component.orcamento?.valor).toBe(350);
    expect(component.orcamento?.previsaoFim).toContain('dia');
  });

  it('aprova o orçamento (PATCH approve)', () => {
    component.solicitar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/budgets/1/approve') && r.method === 'PATCH');
    req.flush({ message: 'ok', work: { id: 5 } });
    expect(component.erro).toBe('');
  });
});
