import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ListagemTransporteFornecedorComponent } from './listagem-transporte-fornecedor';

describe('ListagemTransporteFornecedorComponent', () => {
  let component: ListagemTransporteFornecedorComponent;
  let fixture: ComponentFixture<ListagemTransporteFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemTransporteFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemTransporteFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega os transportes ativos do fornecedor no init', () => {
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/transportations/my-transportations') && r.params.get('isActive') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ transportations: [{ id: 1, name: 'Caminhão' }], currentPage: 1, totalPages: 1, totalRecords: 1 });
    expect(component.transportes.length).toBe(1);
  });

  it('recarrega com isActive=false ao trocar para a aba inativos', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/transportations/my-transportations'))
      .flush({ transportations: [], currentPage: 1, totalPages: 0, totalRecords: 0 });

    component.trocarTab('inativos');
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/transportations/my-transportations') && r.params.get('isActive') === 'false',
    );
    req.flush({ transportations: [], currentPage: 1, totalPages: 0, totalRecords: 0 });
    expect(component.tabAtiva).toBe('inativos');
  });

  it('monta o detalhe a partir de modelo e ano', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/transportations/my-transportations'))
      .flush({ transportations: [], currentPage: 1, totalPages: 0, totalRecords: 0 });
    expect(component.detalhe({ model: 'Delivery 11.180', year: 2016 } as never)).toBe('Delivery 11.180 · 2016');
    expect(component.detalhe({} as never)).toBe('');
  });
});
