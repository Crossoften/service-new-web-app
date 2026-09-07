import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { MercadoPagoCallbackComponent } from './mercado-pago-callback';

describe('MercadoPagoCallbackComponent', () => {
  let component: MercadoPagoCallbackComponent;
  let fixture: ComponentFixture<MercadoPagoCallbackComponent>;
  let httpMock: HttpTestingController;

  function setup(queryParams: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [MercadoPagoCallbackComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } } },
      ],
    });
    fixture = TestBed.createComponent(MercadoPagoCallbackComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }

  afterEach(() => httpMock.verify());

  it('troca o code pelo vínculo e volta para a tela de conta', () => {
    setup({ code: 'TG-abc-123' });
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate');
    const req = httpMock.expectOne((r) => r.url.endsWith('/mercado-pago/oauth/callback') && r.method === 'POST');
    expect(req.request.body.code).toBe('TG-abc-123');
    expect(req.request.body.redirectUri).toContain('/fornecedor/mercado-pago/callback');
    req.flush({ message: 'ok', mpUserId: '999' });
    expect(nav).toHaveBeenCalledWith(['/fornecedor/mercado-pago']);
  });

  it('sem code, mostra erro e não chama a API', () => {
    setup({});
    expect(component.processando).toBe(false);
    expect(component.erro).toContain('Autorização');
    httpMock.expectNone((r) => r.url.endsWith('/mercado-pago/oauth/callback'));
  });
});
