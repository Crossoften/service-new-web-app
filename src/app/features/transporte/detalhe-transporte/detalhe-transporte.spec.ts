import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { DetalheTransporteComponent } from './detalhe-transporte';

describe('DetalheTransporteComponent', () => {
  let component: DetalheTransporteComponent;
  let fixture: ComponentFixture<DetalheTransporteComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalheTransporteComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheTransporteComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/transportations/1')).flush({
      id: 1, name: 'Caminhão baú', price: '85000.00', isActive: true,
      category: { id: 3, name: 'Baú', slug: 'bau' }, user: { id: 15, name: 'Joelson' },
      positiveReviews: 0, negativeReviews: 0, categoryId: 3, userId: 15, createdAt: '', updatedAt: '',
    });
  });

  afterEach(() => httpMock.verify());

  it('exige origem e destino', () => {
    component.solicitar();
    expect(component.erro).toContain('origem');
    httpMock.expectNone((r) => r.url.endsWith('/transport-requests'));
  });

  it('envia CreateTransportRequestDto no POST', () => {
    component.origem = 'Uberlândia';
    component.destino = 'BH';
    component.solicitar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/transport-requests') && r.method === 'POST');
    expect(req.request.body.transportationId).toBe(1);
    expect(req.request.body.origin).toBe('Uberlândia');
    req.flush({ message: 'ok', transportRequest: { id: 7 } });
    expect(component.sucesso).toContain('enviado');
  });
});
