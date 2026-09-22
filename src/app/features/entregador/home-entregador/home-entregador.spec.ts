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
});
