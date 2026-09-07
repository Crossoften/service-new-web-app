import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ListagemProdutosComponent } from './listagem-produtos';

describe('ListagemProdutosComponent', () => {
  let component: ListagemProdutosComponent;
  let fixture: ComponentFixture<ListagemProdutosComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemProdutosComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ categoryId: '3' }), data: {} } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemProdutosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega a vitrine filtrando por categoria', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/products'));
    expect(req.request.params.get('categoryId')).toBe('3');
    req.flush({ products: [{ id: 1, name: 'Fiat', price: '45000.00', transactionType: 'Sale', category: { id: 3, name: 'Veículos', slug: 'veiculos' }, positiveReviews: 0, negativeReviews: 0 }], currentPage: 1, totalPages: 1, totalRecords: 1 });
    expect(component.produtos.length).toBe(1);
    expect(component.produtos[0].name).toBe('Fiat');
  });
});

describe('ListagemProdutosComponent (meus produtos)', () => {
  let component: ListagemProdutosComponent;
  let fixture: ComponentFixture<ListagemProdutosComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemProdutosComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}), data: { mine: true } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemProdutosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('mostra apenas Venda e Venda e aluguel na gestão do fornecedor', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/products/my-products'));
    req.flush({
      products: [
        { id: 1, name: 'Notebook', transactionType: 'Sale', category: { id: 3, name: 'Veículos', slug: 'veiculos' }, positiveReviews: 0, negativeReviews: 0 },
        { id: 2, name: 'Furadeira', transactionType: 'Rent', category: { id: 3, name: 'Veículos', slug: 'veiculos' }, positiveReviews: 0, negativeReviews: 0 },
        { id: 3, name: 'Betoneira', transactionType: 'RentAndSale', category: { id: 3, name: 'Veículos', slug: 'veiculos' }, positiveReviews: 0, negativeReviews: 0 },
      ],
      currentPage: 1,
      totalPages: 1,
      totalRecords: 3,
    });
    expect(component.produtos.map((p) => p.id)).toEqual([1, 3]);
  });
});
