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

  // Mock de roles para teste
  // Futuramente virá da API
  rolesMock: Record<string, string> = {
  '11999999999': 'cliente',
  '11988888888': 'parceiro',
  '11977777777': 'fornecedor',
  '11966666666': 'entregador',
};

  constructor(private router: Router) {}

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

  // Futuramente: chamar API e receber a role do usuário
  const role = this.rolesMock[telefoneLimpo] ?? 'cliente';
  localStorage.setItem('role', role);

  console.log('telefone limpo:', telefoneLimpo);
  console.log('role:', role);

  this.redirecionarPorRole(role);
}

  redirecionarPorRole(role: string) {
  const rotas: Record<string, string> = {
    cliente:    '/home',
    parceiro:   '/parceiro/home',
    fornecedor: '/fornecedor/home',
    entregador: '/home',
  };
  this.router.navigate([rotas[role] ?? '/home']);
}

  cadastrar() {
    this.router.navigate(['/selecionar-perfil']);
  }

  esqueceuSenha() {
    // implementar depois
  }
}