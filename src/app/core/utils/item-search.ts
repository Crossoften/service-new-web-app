/** Ordenações genéricas para as vitrines de itens (produtos, aluguel, transporte, hospedagem). */
export type OrdenacaoItem = 'relevancia' | 'preco-asc' | 'preco-desc' | 'avaliacao';

export const ORDENACOES_ITEM: { id: OrdenacaoItem; label: string }[] = [
  { id: 'relevancia', label: 'Relevância' },
  { id: 'preco-asc', label: 'Menor preço' },
  { id: 'preco-desc', label: 'Maior preço' },
  { id: 'avaliacao', label: 'Melhor avaliação' },
];

/** Campos mínimos que todo item de vitrine expõe (name/price string + likes/dislikes). */
export interface ItemOrdenavel {
  price: string;
  positiveReviews: number;
  negativeReviews: number;
}

/**
 * Ordena a lista sem mutá-la. `relevancia` mantém a ordem do back.
 * `preco` usa `Number(price)`; `avaliacao` usa (positivas − negativas).
 */
export function ordenarItens<T extends ItemOrdenavel>(lista: T[], ordenacao: OrdenacaoItem): T[] {
  switch (ordenacao) {
    case 'preco-asc':
      return [...lista].sort((a, b) => Number(a.price) - Number(b.price));
    case 'preco-desc':
      return [...lista].sort((a, b) => Number(b.price) - Number(a.price));
    case 'avaliacao':
      return [...lista].sort(
        (a, b) => b.positiveReviews - b.negativeReviews - (a.positiveReviews - a.negativeReviews),
      );
    default:
      return lista;
  }
}
