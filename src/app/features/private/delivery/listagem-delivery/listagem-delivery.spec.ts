import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ListagemDeliveryComponent } from './listagem-delivery';
import { Restaurante } from '../../../../core/services/delivery';

function rest(over: Partial<Restaurante>): Restaurante {
  return {
    id: 1, nome: 'R', avaliacao: 4, totalAvaliacoes: 10, tempo: '', tempoMinMinutos: 30,
    taxaEntrega: 5, aberto: true, descricao: '', imagem: '', logo: '', categorias: [],
    ...over,
  };
}

describe('ListagemDeliveryComponent', () => {
  let component: ListagemDeliveryComponent;
  let fixture: ComponentFixture<ListagemDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemDeliveryComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemDeliveryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    component.restaurantes = [
      rest({ id: 1, nome: 'Pizzaria', avaliacao: 4.2, taxaEntrega: 8, tempoMinMinutos: 40, aberto: true }),
      rest({ id: 2, nome: 'Burger King', avaliacao: 4.8, taxaEntrega: 0, tempoMinMinutos: 25, aberto: false }),
      rest({ id: 3, nome: 'Sushi House', avaliacao: 3.9, taxaEntrega: 0, tempoMinMinutos: 55, aberto: true }),
    ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('busca filtra por nome (case-insensitive)', () => {
    component.busca = 'burg';
    expect(component.restaurantesFiltrados.map((r) => r.id)).toEqual([2]);
  });

  it('filtro "aberto agora" esconde os fechados', () => {
    component.toggleAberto();
    expect(component.restaurantesFiltrados.map((r) => r.id)).toEqual([1, 3]);
  });

  it('filtro "entrega grátis" mantém só taxa zero', () => {
    component.toggleGratis();
    expect(component.restaurantesFiltrados.map((r) => r.id)).toEqual([2, 3]);
  });

  it('ordena por melhor avaliação', () => {
    component.selecionarOrdenacao('avaliacao');
    expect(component.restaurantesFiltrados.map((r) => r.id)).toEqual([2, 1, 3]);
  });

  it('ordena por menor taxa e por menor tempo', () => {
    component.selecionarOrdenacao('taxa');
    expect(component.restaurantesFiltrados.map((r) => r.taxaEntrega)).toEqual([0, 0, 8]);
    component.selecionarOrdenacao('tempo');
    expect(component.restaurantesFiltrados.map((r) => r.id)).toEqual([2, 1, 3]);
  });

  it('combina filtro + ordenação e limparFiltros reseta', () => {
    component.toggleGratis();
    component.selecionarOrdenacao('avaliacao');
    expect(component.restaurantesFiltrados.map((r) => r.id)).toEqual([2, 3]);
    expect(component.temFiltroAtivo).toBe(true);
    component.limparFiltros();
    expect(component.temFiltroAtivo).toBe(false);
    expect(component.restaurantesFiltrados.map((r) => r.id)).toEqual([1, 2, 3]); // ordem original
  });
});
