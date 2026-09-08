import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-busca',
  imports: [CommonModule],
  templateUrl: './header-busca.html',
  styleUrl: './header-busca.scss'
})
export class HeaderBuscaComponent {
  @Input() titulo: string = 'BUSCAR';
  @Input() variante: 'padrao' | 'delivery' = 'padrao';
  /** Endereço do cliente (vazio = ainda não definido). Sem valor mockado. */
  @Input() endereco: string = '';
  @Output() buscarChange = new EventEmitter<string>();

  constructor(private router: Router) {}

  get enderecoLabel(): string {
    return this.endereco.trim() || 'Adicionar endereço';
  }

  voltar() {
    this.router.navigate(['/home']);
  }

  /** Toca no endereço → tela de perfil (onde o cliente define/edita com o mapa). */
  irParaEndereco() {
    this.router.navigate(['/perfil']);
  }

  onBuscar(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.buscarChange.emit(valor);
  }
}