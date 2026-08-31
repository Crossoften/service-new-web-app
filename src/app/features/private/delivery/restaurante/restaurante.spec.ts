import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { RestauranteComponent } from './restaurante';

function restaurante(overrides: Record<string, unknown> = {}) {
  return {
    id: 5, name: 'Cantina', isActive: true, isOpen: true,
    category: { id: 1, name: 'Italiana' }, userId: 9,
    menuCategories: [], createdAt: '', updatedAt: '',
    ratingAverage: 4.5, ratingCount: 12,
    ...overrides,
  };
}

describe('RestauranteComponent', () => {
  let component: RestauranteComponent;
  let fixture: ComponentFixture<RestauranteComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestauranteComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RestauranteComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/restaurants/5') && r.method === 'GET').flush(restaurante());
  });

  afterEach(() => httpMock.verify());

  it('mapeia média e total de avaliações', () => {
    expect(component.restaurante?.avaliacao).toBe(4.5);
    expect(component.restaurante?.totalAvaliacoes).toBe(12);
  });

  it('envia avaliação (POST /restaurants/5/reviews)', () => {
    component.abrirAvaliacao();
    component.selecionarNota(5);
    component.comentario = 'Ótimo';
    component.enviarAvaliacao();
    const req = httpMock.expectOne((r) => r.url.endsWith('/restaurants/5/reviews') && r.method === 'POST');
    expect(req.request.body.rating).toBe(5);
    expect(req.request.body.comment).toBe('Ótimo');
    req.flush({ message: 'ok' });
    expect(component.jaAvaliou).toBe(true);
  });

  it('409 marca como já avaliado e esconde a ação', () => {
    component.abrirAvaliacao();
    component.enviarAvaliacao();
    const req = httpMock.expectOne((r) => r.url.endsWith('/restaurants/5/reviews'));
    req.flush({ message: 'x' }, { status: 409, statusText: 'Conflict' });
    expect(component.jaAvaliou).toBe(true);
    expect(component.mostrarAvaliacao).toBe(false);
  });

  it('403 explica que precisa de pedido entregue', () => {
    component.abrirAvaliacao();
    component.enviarAvaliacao();
    const req = httpMock.expectOne((r) => r.url.endsWith('/restaurants/5/reviews'));
    req.flush({ message: 'x' }, { status: 403, statusText: 'Forbidden' });
    expect(component.avaliacaoErro).toContain('pedido');
  });
});
