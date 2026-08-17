import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { DetalheVendaComponent } from './detalhe-venda';

describe('DetalheVendaComponent', () => {
  let component: DetalheVendaComponent;
  let fixture: ComponentFixture<DetalheVendaComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalheVendaComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheVendaComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega o produto pelo id da rota', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/products/1'))
      .flush({
        id: 1,
        name: 'Fiat Bravo',
        transactionType: 'Sale',
        price: '45000.00',
        isActive: true,
        categoryId: 3,
        category: { id: 3, name: 'Carro', slug: 'carro', isActive: true, sortOrder: 1 },
        userId: 15,
        user: { id: 15, name: 'Joelson', email: 'j@e.com' },
        positiveReviews: 0,
        negativeReviews: 0,
        createdAt: '', updatedAt: '',
      });
    expect(component.produto?.name).toBe('Fiat Bravo');
    expect(component.tipoLabel).toBe('Venda');
  });

  it('inicia negociação (POST commercial-transactions)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/products/1')).flush({
      id: 1, name: 'Fiat', transactionType: 'Sale', price: '45000.00', isActive: true,
      categoryId: 3, category: { id: 3, name: 'Carro', slug: 'carro', isActive: true, sortOrder: 1 },
      userId: 15, user: { id: 15, name: 'Joelson', email: 'j@e.com' },
      positiveReviews: 0, negativeReviews: 0, createdAt: '', updatedAt: '',
    });
    component.temInteresse();
    const req = httpMock.expectOne((r) => r.url.endsWith('/commercial-transactions'));
    expect(req.request.body.referenceId).toBe(1);
    expect(req.request.body.requestedAmount).toBe(45000);
    req.flush({ message: 'ok', transaction: { id: 9 } });
    expect(component.sucesso).toContain('Negociação iniciada');
  });
});
