import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { DetalhesPrestadorComponent } from './detalhes-prestador';

describe('DetalhesPrestadorComponent', () => {
  let component: DetalhesPrestadorComponent;
  let fixture: ComponentFixture<DetalhesPrestadorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesPrestadorComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesPrestadorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega o serviço/prestador pelo id', () => {
    httpMock.expectOne((r) => r.url.endsWith('/services/1')).flush({
      id: 1, name: 'Reforma', type: 'Home', price: '150.00', isActive: true,
      category: { id: 3, name: 'Pedreiro', slug: 'p', isActive: true, sortOrder: 1, createdAt: '', updatedAt: '' },
      user: { id: 9, name: 'Joelson', email: 'j@e' }, positiveReviews: 5, negativeReviews: 1, completedWorks: 12,
      categoryId: 3, userId: 9, createdAt: '', updatedAt: '',
    });
    expect(component.prestador?.nome).toBe('Joelson');
    expect(component.prestador?.atendidas).toBe(12);
  });
});
