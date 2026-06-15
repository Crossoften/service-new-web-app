import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  telefone: string = '';
  senha: string = '';
  senhaVisivel: boolean = false;
  erro: string = '';

  constructor(private router: Router) {}

  get telefoneFormatado(): string {
    return this.telefone;
  }

  formatarTelefone(event: Event) {
    let valor = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length > 6) {
      valor = `(${valor.slice(0,2)}) ${valor.slice(2,7)}-${valor.slice(7)}`;
    } else if (valor.length > 2) {
      valor = `(${valor.slice(0,2)}) ${valor.slice(2)}`;
    } else if (valor.length > 0) {
      valor = `(${valor}`;
    }
    this.telefone = valor;
  }

  toggleSenha() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  entrar() {
    this.erro = '';

    const telefoneLimpo = this.telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10) {
      this.erro = 'Informe um telefone válido.';
      return;
    }

    if (this.senha.length < 6) {
      this.erro = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    this.router.navigate(['/home']);
  }

  cadastrar() {
    this.router.navigate(['/selecionar-perfil']);
  }

  esqueceuSenha() {
    // implementar depois
  }
}