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

  function service(over: Record<string, unknown> = {}) {
    return {
      id: 1, name: 'Reforma', type: 'Home', price: '150.00', isActive: true,
      category: { id: 3, name: 'Pedreiro', slug: 'p', isActive: true, sortOrder: 1, createdAt: '', updatedAt: '' },
      user: { id: 9, name: 'Joelson', email: 'j@e' }, positiveReviews: 5, negativeReviews: 1, completedWorks: 12,
      categoryId: 3, userId: 9, createdAt: '', updatedAt: '', ...over,
    };
  }

  it('carrega o serviço/prestador pelo id', () => {
    httpMock.expectOne((r) => r.url.endsWith('/services/1')).flush(service());
    expect(component.prestador?.nome).toBe('Joelson');
  });

  it('sem providerWarranties: garantias zeradas (BE-W7)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/services/1')).flush(service());
    expect(component.prestador?.atendidas).toBe(0);
    expect(component.prestador?.garantiasTotais).toBe(0);
    expect(component.prestador?.naoAtendidas).toBe(0);
  });

  it('mapeia providerWarranties → atendidas/total/não-atendidas (5 de 7)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/services/1')).flush(
      service({
        providerWarranties: {
          warrantiesTotal: 7, warrantiesApproved: 6, warrantiesRejected: 1,
          warrantiesPending: 0, warrantiesCompleted: 5, warrantiesInProgress: 1,
        },
      }),
    );
    expect(component.prestador?.atendidas).toBe(5);
    expect(component.prestador?.garantiasTotais).toBe(7);
    expect(component.prestador?.naoAtendidas).toBe(2);
  });
});
