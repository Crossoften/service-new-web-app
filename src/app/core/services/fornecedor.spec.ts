import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { FornecedorService } from './fornecedor';
import { ResponseRestaurantDto } from '../models/restaurant';

describe('FornecedorService', () => {
  let service: FornecedorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FornecedorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('itensDe mapeia os adicionais do item (ativos e inativos)', () => {
    const r = {
      menuCategories: [
        {
          id: 1,
          name: 'Lanches',
          items: [
            {
              id: 10,
              name: 'X-Burguer',
              price: '20.00',
              isActive: true,
              additions: [
                { id: 1, name: 'Bacon', price: '5.00', isActive: true },
                { id: 2, name: 'Cheddar', price: '3.00', isActive: false },
              ],
            },
          ],
        },
      ],
    } as unknown as ResponseRestaurantDto;

    const itens = service.itensDe(r);
    expect(itens).toHaveLength(1);
    expect(itens[0].adicionais).toEqual([
      { id: 1, nome: 'Bacon', valor: 5, ativo: true },
      { id: 2, nome: 'Cheddar', valor: 3, ativo: false },
    ]);
  });

  it('criarAdicional faz POST com name/price e mapeia o retorno', () => {
    let recebido: unknown;
    service.criarAdicional(7, { nome: 'Borda recheada', valor: 8 }).subscribe((a) => (recebido = a));
    const req = httpMock.expectOne((r) => r.url.endsWith('/restaurants/menu-items/7/additions'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Borda recheada', price: 8 });
    req.flush({ id: 3, name: 'Borda recheada', price: '8.00', isActive: true });
    expect(recebido).toEqual({ id: 3, nome: 'Borda recheada', valor: 8, ativo: true });
  });

  it('removerAdicional faz PATCH isActive:false', () => {
    service.removerAdicional(3).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/restaurants/menu-item-additions/3'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.isActive).toBe(false);
    req.flush({ id: 3, name: 'Borda', price: '8.00', isActive: false });
  });
});
