import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { DetalheAluguelComponent } from './detalhe-aluguel';

describe('DetalheAluguelComponent', () => {
  let component: DetalheAluguelComponent;
  let fixture: ComponentFixture<DetalheAluguelComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalheAluguelComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheAluguelComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/products/1')).flush({
      id: 1, name: 'Betoneira', transactionType: 'Rent', price: '100.00', isActive: true,
      categoryId: 3, category: { id: 3, name: 'Ferramentas', slug: 'ferr', isActive: true, sortOrder: 1 },
      userId: 15, user: { id: 15, name: 'Joelson', email: 'j@e' }, positiveReviews: 0, negativeReviews: 0,
      createdAt: '', updatedAt: '',
    });
  });

  afterEach(() => httpMock.verify());

  it('exige datas antes de solicitar', () => {
    component.solicitar();
    expect(component.erro).toContain('datas');
    httpMock.expectNone((r) => r.url.endsWith('/rentals'));
  });

  it('envia CreateRentalDto no POST /rentals', () => {
    component.dataInicio = '2026-09-01';
    component.dataFim = '2026-09-05';
    component.valor = 100;
    component.solicitar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/rentals') && r.method === 'POST');
    expect(req.request.body.productId).toBe(1);
    expect(req.request.body.price).toBe(100);
    req.flush({ message: 'ok', rental: { id: 7 } });
    expect(component.sucesso).toContain('enviada');
  });
});
