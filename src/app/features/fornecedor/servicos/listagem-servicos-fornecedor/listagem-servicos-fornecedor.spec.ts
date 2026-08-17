import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ListagemServicosFornecedorComponent } from './listagem-servicos-fornecedor';

describe('ListagemServicosFornecedorComponent', () => {
  let component: ListagemServicosFornecedorComponent;
  let fixture: ComponentFixture<ListagemServicosFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemServicosFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemServicosFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega meus serviços ativos', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/services/my-services'));
    expect(req.request.params.get('isActive')).toBe('true');
    req.flush({
      services: [
        { id: 1, name: 'Reforma', type: 'Home', price: '150.00', isActive: true, category: { id: 3, name: 'Pedreiro', slug: 'p' }, user: { id: 9, name: 'Joelson' }, positiveReviews: 0, negativeReviews: 0, completedWorks: 0 },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.servicos.length).toBe(1);
    expect(component.servicos[0].tipo).toBe('Em domicílio');
  });
});
