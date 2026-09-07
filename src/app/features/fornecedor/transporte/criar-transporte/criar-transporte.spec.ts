import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CriarTransporteComponent } from './criar-transporte';

describe('CriarTransporteComponent', () => {
  let component: CriarTransporteComponent;
  let fixture: ComponentFixture<CriarTransporteComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarTransporteComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarTransporteComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/transportations/categories')).flush([]);
  });

  afterEach(() => httpMock.verify());

  it('exige categoria', () => {
    component.salvar();
    expect(component.erro).toContain('categoria');
    httpMock.expectNone((r) => r.url.endsWith('/transportations') && r.method === 'POST');
  });

  it('exige nome', () => {
    component.categoryId = 2;
    component.salvar();
    expect(component.erro).toContain('nome');
    httpMock.expectNone((r) => r.url.endsWith('/transportations') && r.method === 'POST');
  });

  it('exige valor válido', () => {
    component.categoryId = 2;
    component.nome = 'Caminhão baú';
    component.salvar();
    expect(component.erro).toContain('valor');
    httpMock.expectNone((r) => r.url.endsWith('/transportations') && r.method === 'POST');
  });

  it('cadastra o transporte com o DTO correto', () => {
    component.categoryId = 3;
    component.nome = 'Caminhão baú';
    component.preco = 85000;
    component.modelo = 'Delivery 11.180';
    component.ano = 2016;
    component.capacidade = 8;
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/transportations') && r.method === 'POST');
    expect(req.request.body.categoryId).toBe(3);
    expect(req.request.body.name).toBe('Caminhão baú');
    expect(req.request.body.price).toBe(85000);
    expect(req.request.body.model).toBe('Delivery 11.180');
    expect(req.request.body.year).toBe(2016);
    expect(req.request.body.capacity).toBe(8);
    expect(req.request.body.isActive).toBe(true);
    req.flush({ message: 'ok', transportation: { id: 1 } });
  });
});
