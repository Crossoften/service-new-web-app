import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ListagemAluguelComponent } from './listagem-aluguel';

describe('ListagemAluguelComponent', () => {
  let component: ListagemAluguelComponent;
  let fixture: ComponentFixture<ListagemAluguelComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemAluguelComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemAluguelComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('mostra só produtos alugáveis (exclui Sale)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/products')).flush({
      products: [
        { id: 1, name: 'Betoneira', price: '100.00', transactionType: 'Rent' },
        { id: 2, name: 'Notebook', price: '2000.00', transactionType: 'Sale' },
        { id: 3, name: 'Carro', price: '300.00', transactionType: 'RentAndSale' },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 3,
    });
    expect(component.produtos.length).toBe(2);
    expect(component.produtos.map((p) => p.id)).toEqual([1, 3]);
  });
});
