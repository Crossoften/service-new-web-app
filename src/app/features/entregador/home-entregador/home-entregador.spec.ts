import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { HomeEntregadorComponent } from './home-entregador';

describe('HomeEntregadorComponent', () => {
  let component: HomeEntregadorComponent;
  let fixture: ComponentFixture<HomeEntregadorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeEntregadorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeEntregadorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carrega nome e foto do perfil para o header (GET /profile/me)', () => {
    component.carregarPerfil();
    httpMock.expectOne((r) => r.url.endsWith('/profile/me')).flush({
      id: 1, name: 'Carlos', email: 'c@e', role: null, profileType: 'Delivery', status: 'Active',
      fileUrl: 'https://api/v1/files/foto.png', socialMedias: [], createdAt: '', updatedAt: '',
    });
    expect(component.nome).toBe('Carlos');
    expect(component.fotoUrl).toBe('https://api/v1/files/foto.png');
  });

  it('carrega a carteira (available em destaque) de /deliveries/me/earnings', () => {
    component.carregarGanhos();
    httpMock.expectOne((r) => r.url.endsWith('/deliveries/me/earnings')).flush({
      total: { amount: '500.00', deliveries: 42 },
      available: { amount: '80.00', deliveries: 7 },
      paid: { amount: '420.00', deliveries: 35 },
    });
    expect(component.ganhos?.aReceber).toBe(80);
    expect(component.ganhos?.total).toBe(500);
  });

  it('lê a disponibilidade inicial do perfil (isAvailable)', () => {
    component.carregarPerfil();
    httpMock.expectOne((r) => r.url.endsWith('/profile/me')).flush({
      id: 1, name: 'Carlos', email: 'c@e', role: null, profileType: 'Delivery', status: 'Active',
      isAvailable: false, socialMedias: [], createdAt: '', updatedAt: '',
    });
    expect(component.disponivel).toBe(false);
  });

  it('alterna para indisponível (PATCH /deliveries/me/availability)', () => {
    component.disponivel = true;
    component.definirDisponibilidade(false);
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/deliveries/me/availability') && r.method === 'PATCH',
    );
    expect(req.request.body).toEqual({ isAvailable: false });
    req.flush({ isAvailable: false });
    expect(component.disponivel).toBe(false);
    expect(component.salvandoDisponibilidade).toBe(false);
  });

  it('não refaz a chamada quando já está no estado pedido', () => {
    component.disponivel = true;
    component.definirDisponibilidade(true);
    httpMock.expectNone((r) => r.url.endsWith('/deliveries/me/availability'));
  });
});
