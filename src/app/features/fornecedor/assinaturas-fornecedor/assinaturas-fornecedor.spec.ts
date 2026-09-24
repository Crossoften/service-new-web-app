import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AssinaturasFornecedorComponent } from './assinaturas-fornecedor';
import { errorInterceptor } from '../../../core/interceptors/error-interceptor';

function sub(over: Record<string, unknown> = {}) {
  return {
    id: 100, planName: 'Mensal', currentPeriodEnd: '2026-10-20T00:00:00.000Z',
    daysUntilExpiration: 26, needsRenewal: false, inGracePeriod: false,
    expired: false, cancelAtPeriodEnd: false, coversAllCategories: false, ...over,
  };
}
function cat(over: Record<string, unknown> = {}) {
  return { id: 3, name: 'Serviços', slug: 'servicos', isSubscribed: true, subscription: sub(), ...over };
}

describe('AssinaturasFornecedorComponent', () => {
  let component: AssinaturasFornecedorComponent;
  let fixture: ComponentFixture<AssinaturasFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssinaturasFornecedorComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssinaturasFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function flushCatalog(categories: unknown[], subscribedCount = 1) {
    httpMock
      .expectOne((r) => r.url.endsWith('/subscriptions/catalog'))
      .flush({ plans: [], categories, subscribedCount });
  }

  it('lista só categorias assinadas', () => {
    flushCatalog([
      cat({ id: 1, name: 'Delivery' }),
      cat({ id: 2, name: 'Serviços', isSubscribed: false, subscription: undefined }),
    ]);
    expect(component.assinaturas.length).toBe(1);
    expect(component.assinaturas[0].categoriaNome).toBe('Delivery');
    expect(component.temCategoriaDisponivel).toBe(true);
  });

  it('deriva "não renova" + Reativar quando cancelAtPeriodEnd (prioridade sobre needsRenewal)', () => {
    flushCatalog([cat({ subscription: sub({ cancelAtPeriodEnd: true, needsRenewal: true }) })]);
    const vm = component.assinaturas[0];
    expect(vm.acao).toBe('reativar');
    expect(vm.podeCancelar).toBe(false);
    expect(vm.statusTexto).toContain('não renova');
  });

  it('deriva "Vencida" + Renovar + destaque quando expired', () => {
    flushCatalog([cat({ subscription: sub({ expired: true }) })]);
    const vm = component.assinaturas[0];
    expect(vm.acao).toBe('renovar');
    expect(vm.destaque).toBe(true);
    expect(vm.statusTexto).toBe('Vencida');
  });

  it('deriva regularização em N dias quando inGracePeriod', () => {
    flushCatalog([cat({ subscription: sub({ inGracePeriod: true, daysUntilExpiration: 2 }) })]);
    const vm = component.assinaturas[0];
    expect(vm.acao).toBe('renovar');
    expect(vm.destaque).toBe(true);
    expect(vm.statusTexto).toContain('regularize em 2 dias');
  });

  it('deriva "Vence em N dias" + Renovar + Cancelar quando needsRenewal', () => {
    flushCatalog([cat({ subscription: sub({ needsRenewal: true, daysUntilExpiration: 5 }) })]);
    const vm = component.assinaturas[0];
    expect(vm.acao).toBe('renovar');
    expect(vm.podeCancelar).toBe(true);
    expect(vm.statusTexto).toContain('Vence em 5 dias');
  });

  it('assinatura saudável mostra "Ativa até" e permite Cancelar', () => {
    flushCatalog([cat({ subscription: sub() })]);
    const vm = component.assinaturas[0];
    expect(vm.acao).toBeNull();
    expect(vm.podeCancelar).toBe(true);
    expect(vm.statusTexto).toContain('Ativa até');
  });

  it('renovar chama POST /renew e redireciona ao checkout', () => {
    flushCatalog([cat({ subscription: sub({ id: 77, needsRenewal: true }) })]);
    const orig = window.location;
    Object.defineProperty(window, 'location', { configurable: true, value: { href: '' } });

    component.renovar(component.assinaturas[0]);
    const req = httpMock.expectOne((r) => r.url.endsWith('/subscriptions/77/renew'));
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'ok', checkoutUrl: 'https://mp/renew', subscription: {} });

    expect((window.location as unknown as { href: string }).href).toBe('https://mp/renew');
    Object.defineProperty(window, 'location', { configurable: true, value: orig });
  });

  it('cancelar chama PATCH /cancel e recarrega o catálogo', () => {
    flushCatalog([cat({ subscription: sub({ id: 88 }) })]);
    component.cancelar(component.assinaturas[0]);

    const req = httpMock.expectOne((r) => r.url.endsWith('/subscriptions/88/cancel'));
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 88 });

    // Recarrega: agora marcada para cancelar → vira Reativar.
    flushCatalog([cat({ subscription: sub({ id: 88, cancelAtPeriodEnd: true }) })]);
    expect(component.processandoId).toBeNull();
    expect(component.assinaturas[0].acao).toBe('reativar');
  });

  it('reativar chama PATCH /reactivate e recarrega', () => {
    flushCatalog([cat({ subscription: sub({ id: 99, cancelAtPeriodEnd: true }) })]);
    component.reativar(component.assinaturas[0]);

    const req = httpMock.expectOne((r) => r.url.endsWith('/subscriptions/99/reactivate'));
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 99 });

    flushCatalog([cat({ subscription: sub({ id: 99 }) })]);
    expect(component.assinaturas[0].acao).toBeNull();
  });

  it('exibe a mensagem do back quando a ação falha', () => {
    flushCatalog([cat({ subscription: sub({ id: 5, needsRenewal: true }) })]);
    component.renovar(component.assinaturas[0]);
    httpMock
      .expectOne((r) => r.url.endsWith('/subscriptions/5/renew'))
      .flush({ message: 'Ainda não é possível renovar.' }, { status: 400, statusText: 'Bad Request' });
    expect(component.erro).toBe('Ainda não é possível renovar.');
    expect(component.processandoId).toBeNull();
  });

  it('assinarNova navega para a contratação', () => {
    flushCatalog([cat()]);
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.assinarNova();
    expect(nav).toHaveBeenCalledWith(['/fornecedor/assinatura']);
  });

  it('falha ao carregar → mostra erro (sem "não assina") e "Tentar de novo" recarrega', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/subscriptions/catalog'))
      .flush({ message: 'Falhou.' }, { status: 400, statusText: 'Bad Request' });
    expect(component.erro).toBe('Falhou.');
    expect(component.assinaturas.length).toBe(0);

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.assins-erro-box')).not.toBeNull();
    expect(el.textContent).not.toContain('Você ainda não assina');

    // "Tentar de novo" chama carregar() de novo → nova requisição ao catálogo.
    component.carregar();
    flushCatalog([cat()]);
    expect(component.erro).toBe('');
    expect(component.assinaturas.length).toBe(1);
  });
});
