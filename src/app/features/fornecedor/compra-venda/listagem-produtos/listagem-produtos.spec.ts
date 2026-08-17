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
    req.flush({ products: [{ id: 1, name: 'Fiat', price: '45000.00', transactionType: 'Sale' }], currentPage: 1, totalPages: 1, totalRecords: 1 });
    expect(component.produtos.length).toBe(1);
    expect(component.produtos[0].name).toBe('Fiat');
  });
});
