import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ListagemServicosComponent } from './listagem-servicos';

describe('ListagemServicosComponent', () => {
  let component: ListagemServicosComponent;
  let fixture: ComponentFixture<ListagemServicosComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemServicosComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ categoria: '3' }),
              queryParamMap: convertToParamMap({ nome: 'Pedreiro' }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemServicosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista prestadores mapeados por categoria', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/services'));
    expect(req.request.params.get('categoryId')).toBe('3');
    req.flush({
      services: [
        { id: 1, name: 'Reforma', type: 'Home', price: '150.00', isActive: true, category: { id: 3, name: 'Pedreiro', slug: 'p' }, user: { id: 9, name: 'Joelson' }, positiveReviews: 5, negativeReviews: 1, completedWorks: 12 },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.prestadores.length).toBe(1);
    expect(component.prestadores[0].nome).toBe('Joelson');
    expect(component.prestadores[0].gostei).toBe(5);
  });
});
