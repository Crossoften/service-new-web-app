import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CriarProdutoComponent } from './criar-produto';

describe('CriarProdutoComponent', () => {
  let component: CriarProdutoComponent;
  let fixture: ComponentFixture<CriarProdutoComponent>;
  let httpMock: HttpTestingController;

  function setup(params: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [CriarProdutoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(params) } } },
      ],
    });

    fixture = TestBed.createComponent(CriarProdutoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    // ngOnInit carrega as categorias.
    httpMock.expectOne((r) => r.url.endsWith('/products/categories')).flush([]);
  }

  afterEach(() => httpMock.verify());

  it('valida campos obrigatórios antes de enviar', () => {
    setup();
    component.salvar();
    expect(component.erro).toContain('categoria');
    httpMock.expectNone((r) => r.url.endsWith('/products'));
  });

  it('sinaliza ausência de categorias (semCategorias)', () => {
    setup(); // o setup faz flush de [] em /products/categories
    expect(component.semCategorias).toBe(true);
    component.categorias = [{ id: 1, name: 'Veículos' } as never];
    expect(component.semCategorias).toBe(false);
  });

  it('envia CreateProductDto travado em Venda (Sale) no POST /products', () => {
    setup();
    component.categoryId = 3;
    component.nome = 'Fiat';
    component.onPrecoInput('4500000');
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/products') && r.method === 'POST');
    expect(req.request.body.categoryId).toBe(3);
    expect(req.request.body.price).toBe(45000);
    expect(req.request.body.transactionType).toBe('Sale');
    req.flush({ message: 'ok', product: { id: 1 } });
  });

  it('preserva RentAndSale ao editar um produto existente', () => {
    setup({ id: '9' });
    httpMock.expectOne((r) => r.url.endsWith('/products/9') && r.method === 'GET').flush({
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
