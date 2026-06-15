import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export type Perfil = 'cliente' | 'fornecedor' | 'parceiro' | 'entregador';

@Component({
  selector: 'app-selecionar-perfil',
  imports: [CommonModule],
  templateUrl: './selecionar-perfil.html',
  styleUrl: './selecionar-perfil.scss'
})
export class SelecionarPerfilComponent {
  perfilSelecionado: Perfil = 'cliente';

  perfis: { label: string; value: Perfil }[] = [
    { label: 'SOU CLIENTE',        value: 'cliente' },
    { label: 'SOU FORNECEDOR',     value: 'fornecedor' },
    { label: 'QUERO SER PARCEIRO', value: 'parceiro' },
    { label: 'QUERO SER ENTREGADOR', value: 'entregador' },
  ];

  constructor(private router: Router) {}

  selecionar(perfil: Perfil) {
    this.perfilSelecionado = perfil;
  }

  continuar() {
    this.router.navigate(['/cadastro', this.perfilSelecionado]);
  }

  voltar() {
    history.back();
  }
}