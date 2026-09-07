import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CriarAluguelFornecedorComponent } from './criar-aluguel-fornecedor';

describe('CriarAluguelFornecedorComponent', () => {
  let component: CriarAluguelFornecedorComponent;
  let fixture: ComponentFixture<CriarAluguelFornecedorComponent>;
  let httpMock: HttpTestingController;

  function setup(queryParams: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [CriarAluguelFornecedorComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } } },
      ],
    });
    fixture = TestBed.createComponent(CriarAluguelFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/products/categories')).flush([]);
  }

  afterEach(() => httpMock.verify());

  it('exige nome', () => {
    setup();
    component.categoryId = 2;
    component.salvar();
    expect(component.erro).toContain('nome');
    httpMock.expectNone((r) => r.url.endsWith('/products') && r.method === 'POST');
  });

  it('cadastra o item travado em Rent', () => {
    setup();
    component.categoryId = 3;
    component.nome = 'Furadeira';
    component.preco = 50;
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/products') && r.method === 'POST');
    expect(req.request.body.transactionType).toBe('Rent');
    expect(req.request.body.name).toBe('Furadeira');
    expect(req.request.body.price).toBe(50);
    req.flush({ message: 'ok', product: { id: 1 } });
  });

  it('preserva RentAndSale ao editar um item existente', () => {
    setup({ id: '9' });
    const get = httpMock.expectOne((r) => r.url.endsWith('/products/9') && r.method === 'GET');
    get.flush({
      id: 9,
      name: 'Betoneira',
      transactionType: 'RentAndSale',
      price: '120.00',
      categoryId: 4,
      isActive: true,
    });
    expect(component.transactionType).toBe('RentAndSale');
    expect(component.tipoLabel).toBe('Venda e aluguel');

    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/products/9') && r.method === 'PATCH');
    expect(req.request.body.transactionType).toBe('RentAndSale');
    req.flush({ id: 9 });
  });
});
