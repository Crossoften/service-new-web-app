import { Restaurante } from '../services/delivery';

/** Critérios de ordenação da lista de restaurantes. */
export type Ordenacao = 'relevancia' | 'avaliacao' | 'taxa' | 'tempo';

/** Rótulos das ordenações (na ordem de exibição). */
export const ORDENACOES: { id: Ordenacao; label: string }[] = [
  { id: 'relevancia', label: 'Relevância' },
  { id: 'avaliacao', label: 'Melhor avaliação' },
  { id: 'taxa', label: 'Menor taxa de entrega' },
  { id: 'tempo', label: 'Menor tempo de entrega' },
];

export interface FiltrosRestaurante {
  busca?: string;
  aberto?: boolean; // só abertos agora
  gratis?: boolean; // só entrega grátis
  ordenacao?: Ordenacao;
}

/**
 * Filtra por nome/aberto/grátis e ordena, sem mutar a lista original.
 * `relevancia` mantém a ordem que veio do back. Reutilizado pela listagem por
 * categoria e pela busca global (tela de categorias).
 */
export function filtrarEOrdenarRestaurantes(
  lista: Restaurante[],
  filtros: FiltrosRestaurante,
): Restaurante[] {
  const termo = (filtros.busca ?? '').trim().toLowerCase();
  const filtrada = lista.filter((r) => {
    if (termo && !r.nome.toLowerCase().includes(termo)) return false;
    if (filtros.aberto && !r.aberto) return false;
    if (filtros.gratis && r.taxaEntrega > 0) return false;
    return true;
  });

  switch (filtros.ordenacao) {
    case 'avaliacao':
      return [...filtrada].sort((a, b) => b.avaliacao - a.avaliacao);
    case 'taxa':
      return [...filtrada].sort((a, b) => a.taxaEntrega - b.taxaEntrega);
    case 'tempo':
      return [...filtrada].sort(
        (a, b) => (a.tempoMinMinutos ?? Infinity) - (b.tempoMinMinutos ?? Infinity),
      );
    default:
      return filtrada;
  }
}
