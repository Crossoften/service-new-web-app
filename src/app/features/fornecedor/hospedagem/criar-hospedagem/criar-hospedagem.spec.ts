import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CriarHospedagemComponent } from './criar-hospedagem';

describe('CriarHospedagemComponent', () => {
  let component: CriarHospedagemComponent;
  let fixture: ComponentFixture<CriarHospedagemComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarHospedagemComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarHospedagemComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/accommodations/categories')).flush([]);
  });

  afterEach(() => httpMock.verify());

  it('exige categoria', () => {
    component.salvar();
    expect(component.erro).toContain('categoria');
    httpMock.expectNone((r) => r.url.endsWith('/accommodations') && r.method === 'POST');
  });

  it('exige nome', () => {
    component.categoryId = 2;
    component.salvar();
    expect(component.erro).toContain('nome');
    httpMock.expectNone((r) => r.url.endsWith('/accommodations') && r.method === 'POST');
  });

  it('exige valor válido', () => {
    component.categoryId = 2;
    component.nome = 'Pousada Sol';
    component.salvar();
    expect(component.erro).toContain('valor');
    httpMock.expectNone((r) => r.url.endsWith('/accommodations') && r.method === 'POST');
  });

  it('cadastra a hospedagem com o DTO correto', () => {
    component.categoryId = 3;
    component.nome = 'Pousada Sol';
    component.preco = 320;
    component.quartos = 5;
    component.cidade = 'Uberlândia';
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/accommodations') && r.method === 'POST');
    expect(req.request.body.categoryId).toBe(3);
    expect(req.request.body.name).toBe('Pousada Sol');
    expect(req.request.body.price).toBe(320);
    expect(req.request.body.roomsQuantity).toBe(5);
    expect(req.request.body.city).toBe('Uberlândia');
    expect(req.request.body.isActive).toBe(true);
    req.flush({ message: 'ok', accommodation: { id: 1 } });
  });
});
