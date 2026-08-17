import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ListagemTransporteComponent } from './listagem-transporte';

describe('ListagemTransporteComponent', () => {
  let component: ListagemTransporteComponent;
  let fixture: ComponentFixture<ListagemTransporteComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemTransporteComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ categoryId: '2' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemTransporteComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista veículos filtrando por categoria', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/transportations'));
    expect(req.request.params.get('categoryId')).toBe('2');
    req.flush({
      transportations: [{ id: 1, name: 'Caminhão baú', price: '85000.00', isActive: true }],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.itens.length).toBe(1);
  });
});
