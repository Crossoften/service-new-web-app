import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Chips de estatística do prestador/serviço — avaliações positivas/negativas e,
 * opcionalmente, uma 3ª métrica (negociações/garantias). Substitui os emojis
 * 👍/👎/🗂 por ícones SVG consistentes e tematizáveis (claro/escuro).
 */
@Component({
  selector: 'app-stat-chips',
  imports: [CommonModule],
  templateUrl: './stat-chips.html',
  styleUrl: './stat-chips.scss',
})
export class StatChipsComponent {
  @Input() positivas = 0;
  @Input() negativas = 0;
  /** 3ª métrica opcional (ex.: negociações / concluídos). Omitida → não renderiza. */
  @Input() extra?: number | null;
  /** Ícone do 3º chip: documento (negociações) ou check (concluídos). */
  @Input() extraIcone: 'doc' | 'check' = 'doc';
  /** Tooltip do 3º chip. */
  @Input() extraTitulo = 'Negociações';
}
