import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ListagemHospedagemFornecedorComponent } from './listagem-hospedagem-fornecedor';

describe('ListagemHospedagemFornecedorComponent', () => {
  let component: ListagemHospedagemFornecedorComponent;
  let fixture: ComponentFixture<ListagemHospedagemFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemHospedagemFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemHospedagemFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega as hospedagens ativas do fornecedor no init', () => {
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/accommodations/my-accommodations') && r.params.get('isActive') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ accommodations: [{ id: 1, name: 'Pousada' }], currentPage: 1, totalPages: 1, totalRecords: 1 });
    expect(component.acomodacoes.length).toBe(1);
  });

  it('recarrega com isActive=false ao trocar para a aba inativas', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/accommodations/my-accommodations'))
      .flush({ accommodations: [], currentPage: 1, totalPages: 0, totalRecords: 0 });

    component.trocarTab('inativas');
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/accommodations/my-accommodations') && r.params.get('isActive') === 'false',
    );
    req.flush({ accommodations: [], currentPage: 1, totalPages: 0, totalRecords: 0 });
    expect(component.tabAtiva).toBe('inativas');
  });

  it('monta o local a partir de cidade e estado', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/accommodations/my-accommodations'))
      .flush({ accommodations: [], currentPage: 1, totalPages: 0, totalRecords: 0 });
    expect(component.local({ city: 'Uberlândia', state: 'MG' } as never)).toBe('Uberlândia · MG');
    expect(component.local({} as never)).toBe('');
  });
});
