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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarProdutoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarProdutoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    // ngOnInit carrega as categorias (modo criação, sem id).
    httpMock.expectOne((r) => r.url.endsWith('/products/categories')).flush([]);
  });

  afterEach(() => httpMock.verify());

  it('valida campos obrigatórios antes de enviar', () => {
    component.salvar();
    expect(component.erro).toContain('categoria');
    httpMock.expectNone((r) => r.url.endsWith('/products'));
  });

  it('envia CreateProductDto no POST /products', () => {
    component.categoryId = 3;
    component.nome = 'Fiat';
    component.preco = 45000;
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/products') && r.method === 'POST');
    expect(req.request.body.categoryId).toBe(3);
    expect(req.request.body.price).toBe(45000);
    req.flush({ message: 'ok', product: { id: 1 } });
  });
});
