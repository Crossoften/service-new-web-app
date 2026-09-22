import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CouponService, CupomPrevia } from './coupon';

describe('CouponService', () => {
  let service: CouponService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CouponService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('valida o cupom (POST /coupons/validate) e mapeia a prévia', () => {
    let previa: CupomPrevia | undefined;
    service.validar({ code: 'BEMVINDO10', restaurantId: 1, itemsValue: 100 }).subscribe((p) => (previa = p));
    const req = httpMock.expectOne((r) => r.url.endsWith('/coupons/validate') && r.method === 'POST');
    expect(req.request.body).toEqual({ code: 'BEMVINDO10', restaurantId: 1, itemsValue: 100 });
    req.flush({ code: 'BEMVINDO10', type: 'Percent', discount: '10.00', description: '10% de desconto' });
    expect(previa).toEqual({ codigo: 'BEMVINDO10', tipo: 'Percent', desconto: 10, descricao: '10% de desconto' });
  });

  it('propaga o 400 (cupom inválido) para a tela mostrar a razão', () => {
    let erro: unknown;
    service.validar({ code: 'X', restaurantId: 1, itemsValue: 10 }).subscribe({ error: (e) => (erro = e) });
    httpMock
      .expectOne((r) => r.url.endsWith('/coupons/validate'))
      .flush({ message: 'Cupom fora da validade' }, { status: 400, statusText: 'Bad Request' });
    expect(erro).toBeTruthy();
  });
});
