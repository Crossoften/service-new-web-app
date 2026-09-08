import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { HomeComponent } from './home';
import { SessionService } from '../../../core/services/session';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // ngOnInit → GET /profile/me + GET /food-orders
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra o nome real do cliente e a inicial (sem mock)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/profile/me')).flush({ id: 1, name: 'Ana Souza' });
    httpMock.expectOne((r) => r.url.endsWith('/food-orders')).flush({ foodOrders: [] });
    expect(component.nomeExibicao).toBe('Ana Souza');
    expect(component.inicial).toBe('A');
  });

  it('destaca apenas pedidos em andamento (não entregues/cancelados)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/profile/me')).flush({ id: 1, name: 'Ana' });
    httpMock.expectOne((r) => r.url.endsWith('/food-orders')).flush({
      foodOrders: [
        { id: 1, status: 'OnTheWay', restaurant: { id: 2, name: 'Cantina' } },
        { id: 2, status: 'Delivered', restaurant: { id: 3, name: 'X' } },
        { id: 3, status: 'Cancelled', restaurant: { id: 4, name: 'Y' } },
      ],
    });
    expect(component.pedidosAtivos.map((p) => p.id)).toEqual([1]);
    expect(component.pedidoAtivo?.id).toBe(1);
  });

  it('sair() limpa a sessão', () => {
    const session = TestBed.inject(SessionService);
    session.setSession({ token: 't', userId: 1, profileType: 'Client', role: null });
    component.sair();
    expect(session.isAuthenticated()).toBe(false);
  });
});
