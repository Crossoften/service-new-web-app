import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { RestauranteFornecedorComponent } from './restaurante-fornecedor';

describe('RestauranteFornecedorComponent', () => {
  let component: RestauranteFornecedorComponent;
  let fixture: ComponentFixture<RestauranteFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestauranteFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RestauranteFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    // Sem detectChanges: evita o ngOnInit (carrega categorias/restaurante).
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('envia o tempo de entrega no POST /restaurants', () => {
    component.categorias = [{ id: 2, name: 'Lanches' } as never];
    component.nome = 'Cantina';
    component.categoriaId = 2;
    component.tempoMin = 30;
    component.tempoMax = 45;
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/restaurants') && r.method === 'POST');
    expect(req.request.body.deliveryTimeMinMinutes).toBe(30);
    expect(req.request.body.deliveryTimeMaxMinutes).toBe(45);
    req.flush({ message: 'ok', restaurant: { id: 1, name: 'Cantina' } });
  });

  it('envia o endereço do restaurante com coordenadas no POST', () => {
    component.categorias = [{ id: 2, name: 'Lanches' } as never];
    component.nome = 'Cantina';
    component.categoriaId = 2;
    component.ruaEnd = 'Rua A';
    component.cidadeEnd = 'Uberlândia';
    component.onCoordenadas({ latitude: '-18.9186', longitude: '-48.2772' });
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/restaurants') && r.method === 'POST');
    expect(req.request.body.address.street).toBe('Rua A');
    expect(req.request.body.address.city).toBe('Uberlândia');
    expect(req.request.body.address.latitude).toBe('-18.9186');
    expect(req.request.body.address.longitude).toBe('-48.2772');
    req.flush({ message: 'ok', restaurant: { id: 1, name: 'Cantina' } });
  });

  it('não envia address quando nenhum campo de endereço foi preenchido', () => {
    component.categorias = [{ id: 2, name: 'Lanches' } as never];
    component.nome = 'Cantina';
    component.categoriaId = 2;
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/restaurants') && r.method === 'POST');
    expect(req.request.body.address).toBeUndefined();
    req.flush({ message: 'ok', restaurant: { id: 1, name: 'Cantina' } });
  });

  it('bloqueia tempo inválido (máximo menor que mínimo)', () => {
    component.categorias = [{ id: 2, name: 'Lanches' } as never];
    component.nome = 'Cantina';
    component.categoriaId = 2;
    component.tempoMin = 45;
    component.tempoMax = 30;
    component.salvar();
    expect(component.erro).toContain('Tempo de entrega');
    httpMock.expectNone((r) => r.url.endsWith('/restaurants') && r.method === 'POST');
  });
});
