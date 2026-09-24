import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AssinaturaFornecedorComponent } from './assinatura-fornecedor';

function plan(over: Record<string, unknown> = {}) {
  return {
    id: 1, name: 'Mensal', slug: 'mensal', price: '19.90', monthlyPrice: '19.90',
    interval: 'Month', intervalCount: 1, bonusMonths: 0, isActive: true, sortOrder: 1,
    createdAt: '', updatedAt: '', ...over,
  };
}
function categoria(over: Record<string, unknown> = {}) {
  return { id: 3, name: 'Serviços', slug: 'servicos', isSubscribed: false, ...over };
}

describe('AssinaturaFornecedorComponent', () => {
  let component: AssinaturaFornecedorComponent;
  let fixture: ComponentFixture<AssinaturaFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssinaturaFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AssinaturaFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function flushCatalog(categories: unknown[], plans: unknown[] = [plan()]) {
    httpMock
      .expectOne((r) => r.url.endsWith('/subscriptions/catalog'))
      .flush({ plans, categories, subscribedCount: 0 });
  }

  it('should create', () => {
    flushCatalog([categoria()]);
    expect(component).toBeTruthy();
  });

  it('pré-seleciona a primeira categoria não assinada e ignora as já assinadas', () => {
    flushCatalog([
      categoria({ id: 1, name: 'Delivery', isSubscribed: true }),
      categoria({ id: 2, name: 'Serviços' }),
    ]);
    expect(component.categoriaSelecionada).toBe(2);
    expect(component.temCategoriasDisponiveis).toBe(true);
  });

  it('não seleciona categoria já assinada', () => {
    flushCatalog([categoria({ id: 5, name: 'Delivery', isSubscribed: true })]);
    component.selecionarCategoria(component.categorias[0]);
    expect(component.categoriaSelecionada).toBeNull();
    expect(component.temCategoriasDisponiveis).toBe(false);
  });

  it('monta o DTO com planId + categoryId e redireciona ao checkout', () => {
    flushCatalog([categoria({ id: 3 })], [plan({ id: 9 })]);
    component.categoriaSelecionada = 3;
    component.planoSelecionado = 9;

    const orig = window.location;
    Object.defineProperty(window, 'location', { configurable: true, value: { href: '' } });

    component.assinar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/subscriptions'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ planId: 9, categoryId: 3 });
    req.flush({ message: 'ok', checkoutUrl: 'https://mp/checkout', subscription: {} });

    expect((window.location as unknown as { href: string }).href).toBe('https://mp/checkout');
    Object.defineProperty(window, 'location', { configurable: true, value: orig });
  });

  it('inclui payerEmail quando informado', () => {
    flushCatalog([categoria({ id: 3 })], [plan({ id: 9 })]);
    component.categoriaSelecionada = 3;
    component.planoSelecionado = 9;
    component.payerEmail = ' pagador@email.com ';

    const orig = window.location;
    Object.defineProperty(window, 'location', { configurable: true, value: { href: '' } });

    component.assinar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/subscriptions'));
    expect(req.request.body).toEqual({ planId: 9, categoryId: 3, payerEmail: 'pagador@email.com' });
    req.flush({ message: 'ok', checkoutUrl: 'https://mp/c', subscription: {} });

    Object.defineProperty(window, 'location', { configurable: true, value: orig });
  });

  it('bloqueia assinatura sem categoria selecionada', () => {
    flushCatalog([categoria()]);
    component.categoriaSelecionada = null;
    component.assinar();
    expect(component.erro).toBe('Selecione uma categoria.');
    httpMock.expectNone((r) => r.url.endsWith('/subscriptions'));
  });
});
