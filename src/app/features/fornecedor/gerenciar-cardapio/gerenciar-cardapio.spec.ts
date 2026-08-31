import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { GerenciarCardapioComponent } from './gerenciar-cardapio';

function restauranteComItem() {
  return {
    id: 1, name: 'R', isActive: true, isOpen: true,
    category: { id: 1, name: 'X' }, userId: 9, createdAt: '', updatedAt: '',
    menuCategories: [
      { id: 2, name: 'Cat', sortOrder: 0, items: [
        { id: 10, name: 'Pizza', price: '30.00', isActive: true },
      ] },
    ],
  };
}

describe('GerenciarCardapioComponent', () => {
  let component: GerenciarCardapioComponent;
  let fixture: ComponentFixture<GerenciarCardapioComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarCardapioComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarCardapioComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/restaurants/me') && r.method === 'GET').flush(restauranteComItem());
  });

  afterEach(() => httpMock.verify());

  it('carrega os itens ativos', () => {
    expect(component.itens.length).toBe(1);
    expect(component.itens[0].id).toBe(10);
  });

  it('excluir chama DELETE e mostra mensagem de desativado (deleted:false)', () => {
    component.excluir(component.itens[0]);
    const req = httpMock.expectOne((r) => r.url.endsWith('/restaurants/menu-items/10') && r.method === 'DELETE');
    req.flush({ deleted: false, message: 'Item desativado pois já consta em pedidos.' });
    expect(component.itens.length).toBe(0);
    expect(component.aviso).toContain('desativado');
  });

  it('deleted:true remove o item', () => {
    component.excluir(component.itens[0]);
    const req = httpMock.expectOne((r) => r.url.endsWith('/restaurants/menu-items/10') && r.method === 'DELETE');
    req.flush({ deleted: true });
    expect(component.itens.length).toBe(0);
    expect(component.aviso).toContain('excluído');
  });
});
