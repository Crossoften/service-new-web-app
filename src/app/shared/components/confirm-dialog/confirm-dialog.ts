import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Diálogo de confirmação para ações destrutivas/irreversíveis (ex.: recusar, cancelar).
 * Sem lógica de domínio: o pai controla `aberto` e reage a `(confirmar)` / `(fechar)`.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialogComponent {
  @Input() aberto = false;
  @Input() titulo = 'Confirmar ação';
  @Input() mensagem = 'Tem certeza? Esta ação não pode ser desfeita.';
  @Input() confirmarLabel = 'Confirmar';
  @Input() cancelarLabel = 'Voltar';
  @Input() processando = false;
  @Output() confirmar = new EventEmitter<void>();
  @Output() fechar = new EventEmitter<void>();
}
