import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { MercadoPagoFornecedorComponent } from './mercado-pago-fornecedor';

describe('MercadoPagoFornecedorComponent', () => {
  let component: MercadoPagoFornecedorComponent;
  let fixture: ComponentFixture<MercadoPagoFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MercadoPagoFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MercadoPagoFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega o status do vínculo no init', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/mercado-pago/status'));
    expect(req.request.method).toBe('GET');
    req.flush({ isLinked: true, mpUserId: '123456789' });
    expect(component.status?.isLinked).toBe(true);
    expect(component.status?.mpUserId).toBe('123456789');
  });

  it('conectar() pede a connect-url com o redirectUri do app', () => {
    httpMock.expectOne((r) => r.url.endsWith('/mercado-pago/status')).flush({ isLinked: false });
    component.conectar();
    // Não fazemos flush: o next redireciona o browser (window.location) — basta validar a chamada.
    const req = httpMock.expectOne((r) => r.url.endsWith('/mercado-pago/connect-url'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('redirectUri')).toContain('/fornecedor/mercado-pago/callback');
    expect(component.conectando).toBe(true);
  });
});
