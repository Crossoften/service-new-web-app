import { ordenarItens, ItemOrdenavel } from './item-search';

function item(over: Partial<ItemOrdenavel> & { id: number }): ItemOrdenavel & { id: number } {
  return { price: '10', positiveReviews: 0, negativeReviews: 0, ...over };
}

const lista = [
  item({ id: 1, price: '30', positiveReviews: 2, negativeReviews: 1 }), // score 1
  item({ id: 2, price: '10', positiveReviews: 9, negativeReviews: 1 }), // score 8
  item({ id: 3, price: '20', positiveReviews: 5, negativeReviews: 0 }), // score 5
];

describe('ordenarItens', () => {
  it('relevancia mantém a ordem e não muta', () => {
    const out = ordenarItens(lista, 'relevancia');
    expect(out.map((i) => i.id)).toEqual([1, 2, 3]);
    expect(lista.map((i) => i.id)).toEqual([1, 2, 3]);
  });

  it('ordena por menor e maior preço', () => {
    expect(ordenarItens(lista, 'preco-asc').map((i) => i.price)).toEqual(['10', '20', '30']);
    expect(ordenarItens(lista, 'preco-desc').map((i) => i.price)).toEqual(['30', '20', '10']);
  });

  it('ordena por avaliação (positivas − negativas)', () => {
    expect(ordenarItens(lista, 'avaliacao').map((i) => i.id)).toEqual([2, 3, 1]);
  });
});
