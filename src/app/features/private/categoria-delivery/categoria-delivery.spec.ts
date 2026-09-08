import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CategoriaDeliveryComponent } from './categoria-delivery';
import { Restaurante } from '../../../core/services/delivery';

function rest(over: Partial<Restaurante>): Restaurante {
  return {
    id: 1, nome: 'R', avaliacao: 4, totalAvaliacoes: 0, tempo: '', tempoMinMinutos: 30,
    taxaEntrega: 5, aberto: true, descricao: '', imagem: '', logo: '', categorias: [],
    ...over,
  };
}

describe('CategoriaDeliveryComponent', () => {
  let component: CategoriaDeliveryComponent;
  let fixture: ComponentFixture<CategoriaDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaDeliveryComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaDeliveryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    component.restaurantes = [
      rest({ id: 1, nome: 'Pizzaria', taxaEntrega: 8, aberto: true }),
      rest({ id: 2, nome: 'Burger King', taxaEntrega: 0, aberto: false }),
    ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('buscando é falso sem texto e verdadeiro com texto', () => {
    expect(component.buscando).toBe(false);
    component.busca = 'burg';
    expect(component.buscando).toBe(true);
  });

  it('resultados aplica busca + filtros globalmente', () => {
    component.busca = 'r'; // casa "Pizzaria" e "Burger King"
    expect(component.resultados.map((r) => r.id)).toEqual([1, 2]);
    component.toggleGratis(); // só entrega grátis → Burger King
    expect(component.resultados.map((r) => r.id)).toEqual([2]);
  });

  it('limparFiltros reseta e temFiltroAtivo acompanha', () => {
    component.toggleAberto();
    component.selecionarOrdenacao('avaliacao');
    expect(component.temFiltroAtivo).toBe(true);
    component.limparFiltros();
    expect(component.temFiltroAtivo).toBe(false);
  });
});
