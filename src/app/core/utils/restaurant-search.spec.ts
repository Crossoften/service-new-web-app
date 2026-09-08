import { filtrarEOrdenarRestaurantes } from './restaurant-search';
import { Restaurante } from '../services/delivery';

function rest(over: Partial<Restaurante>): Restaurante {
  return {
    id: 1, nome: 'R', avaliacao: 4, totalAvaliacoes: 0, tempo: '', tempoMinMinutos: 30,
    taxaEntrega: 5, aberto: true, descricao: '', imagem: '', logo: '', categorias: [],
    ...over,
  };
}

const lista: Restaurante[] = [
  rest({ id: 1, nome: 'Pizzaria', avaliacao: 4.2, taxaEntrega: 8, tempoMinMinutos: 40, aberto: true }),
  rest({ id: 2, nome: 'Burger King', avaliacao: 4.8, taxaEntrega: 0, tempoMinMinutos: 25, aberto: false }),
  rest({ id: 3, nome: 'Sushi House', avaliacao: 3.9, taxaEntrega: 0, tempoMinMinutos: 55, aberto: true }),
];

describe('filtrarEOrdenarRestaurantes', () => {
  it('filtra por nome (case-insensitive)', () => {
    expect(filtrarEOrdenarRestaurantes(lista, { busca: 'BURG' }).map((r) => r.id)).toEqual([2]);
  });

  it('filtra por aberto e por entrega grátis', () => {
    expect(filtrarEOrdenarRestaurantes(lista, { aberto: true }).map((r) => r.id)).toEqual([1, 3]);
    expect(filtrarEOrdenarRestaurantes(lista, { gratis: true }).map((r) => r.id)).toEqual([2, 3]);
  });

  it('ordena por avaliação, taxa e tempo', () => {
    expect(filtrarEOrdenarRestaurantes(lista, { ordenacao: 'avaliacao' }).map((r) => r.id)).toEqual([2, 1, 3]);
    expect(filtrarEOrdenarRestaurantes(lista, { ordenacao: 'taxa' }).map((r) => r.taxaEntrega)).toEqual([0, 0, 8]);
    expect(filtrarEOrdenarRestaurantes(lista, { ordenacao: 'tempo' }).map((r) => r.id)).toEqual([2, 1, 3]);
  });

  it('relevância mantém a ordem original e não muta a lista', () => {
    const saida = filtrarEOrdenarRestaurantes(lista, { ordenacao: 'relevancia' });
    expect(saida.map((r) => r.id)).toEqual([1, 2, 3]);
    expect(lista.map((r) => r.id)).toEqual([1, 2, 3]); // original intacta
  });

  it('combina filtro + ordenação', () => {
    const saida = filtrarEOrdenarRestaurantes(lista, { gratis: true, ordenacao: 'avaliacao' });
    expect(saida.map((r) => r.id)).toEqual([2, 3]);
  });
});
