import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ListagemHospedagemComponent } from './listagem-hospedagem';

describe('ListagemHospedagemComponent', () => {
  let component: ListagemHospedagemComponent;
  let fixture: ComponentFixture<ListagemHospedagemComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemHospedagemComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ categoryId: '3' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemHospedagemComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista hospedagens filtrando por categoria', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/accommodations'));
    expect(req.request.params.get('categoryId')).toBe('3');
    req.flush({
      accommodations: [{ id: 1, name: 'Novo Leste Hotel', price: '320.00', isActive: true }],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.itens.length).toBe(1);
  });
});
