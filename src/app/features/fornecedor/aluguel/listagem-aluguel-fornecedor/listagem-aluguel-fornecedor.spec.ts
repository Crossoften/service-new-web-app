import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ListagemAluguelFornecedorComponent } from './listagem-aluguel-fornecedor';

describe('ListagemAluguelFornecedorComponent', () => {
  let component: ListagemAluguelFornecedorComponent;
  let fixture: ComponentFixture<ListagemAluguelFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemAluguelFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemAluguelFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega os produtos do fornecedor e mostra apenas Rent e RentAndSale', () => {
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/products/my-products') && r.params.get('isActive') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      products: [
        { id: 1, name: 'Furadeira', transactionType: 'Rent' },
        { id: 2, name: 'Notebook', transactionType: 'Sale' },
        { id: 3, name: 'Betoneira', transactionType: 'RentAndSale' },
      ],
      currentPage: 1,
      totalPages: 1,
      totalRecords: 3,
    });
    expect(component.itens.map((p) => p.id)).toEqual([1, 3]);
  });

  it('recarrega com isActive=false ao trocar para a aba inativos', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/products/my-products'))
      .flush({ products: [], currentPage: 1, totalPages: 0, totalRecords: 0 });

    component.trocarTab('inativos');
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/products/my-products') && r.params.get('isActive') === 'false',
    );
    req.flush({ products: [], currentPage: 1, totalPages: 0, totalRecords: 0 });
    expect(component.tabAtiva).toBe('inativos');
  });
});
