import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { SacolaComponent } from './sacola';
import { DeliveryService } from '../../../../core/services/delivery';

describe('SacolaComponent', () => {
  let component: SacolaComponent;
  let fixture: ComponentFixture<SacolaComponent>;
  let service: DeliveryService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SacolaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SacolaComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(DeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
    service.setPedidoRestaurante({ id: 7 } as never);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('subtotalItem soma adicionais e multiplica pela quantidade', () => {
    component.ngOnInit();
    const ip = { item: { preco: 10 }, quantidade: 2, adicionaisSelecionados: [{ preco: 3 }] } as never;
    expect(component.subtotalItem(ip)).toBe(26); // (10 + 3) × 2
  });

  it('incrementar/decrementar ajustam a quantidade (mínimo 1)', () => {
    service.addItem({ id: 3, preco: 10 } as never, 1, []);
    component.ngOnInit();
    component.incrementar(0);
    expect(component.itens[0].quantidade).toBe(2);
    component.decrementar(0);
    component.decrementar(0); // não passa de 1
    expect(component.itens[0].quantidade).toBe(1);
  });

  it('remover tira a linha da sacola', () => {
    service.addItem({ id: 3, preco: 10 } as never, 1, []);
    service.addItem({ id: 4, preco: 5 } as never, 1, []);
    component.ngOnInit();
    component.remover(0);
    expect(component.itens.length).toBe(1);
    expect(component.itens[0].item.id).toBe(4);
  });

  it('continuar não navega com a sacola vazia', () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate');
    component.ngOnInit(); // sem itens
    component.continuar();
    expect(nav).not.toHaveBeenCalled();
  });

  it('selecionarGorjeta guarda a gorjeta e entra no total (§8.9)', () => {
    service.addItem({ id: 3, preco: 10 } as never, 1, []);
    component.ngOnInit();
    component.selecionarGorjeta(5);
    expect(component.gorjeta).toBe(5);
    expect(component.total).toBe(15); // subtotal 10 + gorjeta 5
  });

  it('aplicarCupom valida (POST /coupons/validate) e aplica a prévia', () => {
    service.addItem({ id: 3, preco: 100 } as never, 1, []);
    component.ngOnInit();
    component.cupomCodigo = 'BEMVINDO10';
    component.aplicarCupom();
    const req = httpMock.expectOne((r) => r.url.endsWith('/coupons/validate') && r.method === 'POST');
    expect(req.request.body).toEqual({ code: 'BEMVINDO10', restaurantId: 7, itemsValue: 100 });
    req.flush({ code: 'BEMVINDO10', type: 'Percent', discount: '10.00', description: '10%' });
    expect(component.cupom?.desconto).toBe(10);
    expect(component.total).toBe(90); // 100 − 10
  });

  it('agendar com data passada bloqueia o continuar (§8.9)', () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate');
    service.addItem({ id: 3, preco: 10 } as never, 1, []);
    component.ngOnInit();
    component.selecionarAgendar(true);
    component.dataAgendada = '2020-01-01T10:00';
    component.continuar();
    expect(component.agendaErro.toLowerCase()).toContain('futuro');
    expect(nav).not.toHaveBeenCalled();
  });

  it('agendar com data futura guarda o ISO e navega', () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate');
    const spy = vi.spyOn(service, 'setAgendamento');
    service.addItem({ id: 3, preco: 10 } as never, 1, []);
    component.ngOnInit();
    component.selecionarAgendar(true);
    component.dataAgendada = '2099-12-31T20:00';
    component.continuar();
    expect(spy).toHaveBeenCalled();
    expect(nav).toHaveBeenCalledWith(['/delivery/endereco']);
  });

  it('cupom inválido (400) mostra a mensagem e não aplica', () => {
    service.addItem({ id: 3, preco: 50 } as never, 1, []);
    component.ngOnInit();
    component.cupomCodigo = 'ZZZ';
    component.aplicarCupom();
    httpMock
      .expectOne((r) => r.url.endsWith('/coupons/validate'))
      .flush({ message: 'Cupom fora da validade' }, { status: 400, statusText: 'Bad Request' });
    // Erro exibido (o texto exato da API vem do errorInterceptor em produção) e cupom não aplicado.
    expect(component.cupom).toBeFalsy();
    expect(component.cupomErro.length).toBeGreaterThan(0);
  });
});
