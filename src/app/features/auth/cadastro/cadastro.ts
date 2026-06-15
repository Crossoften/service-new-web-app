import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type Perfil = 'cliente' | 'fornecedor' | 'parceiro' | 'entregador';

@Component({
  selector: 'app-cadastro',
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss'
})
export class CadastroComponent implements OnInit {
  perfil: Perfil = 'cliente';
  step: number = 1;

  // Step 1 - Dados
  nome: string = '';
  telefone: string = '';
  codigo: string = '';
  termosAceitos: boolean = false;

  // Step 1 - Parceiro (redes sociais)
  instagram: string = '';
  facebook: string = '';
  youtube: string = '';
  twitter: string = '';
  site: string = '';

  // Step 2 - SMS
  sms: string[] = ['', '', '', ''];

  // Step 3 - Senha
  senha: string = '';
  confirmarSenha: string = '';
  senhaVisivel: boolean = false;
  confirmarSenhaVisivel: boolean = false;

  // Step 4 - Planos (fornecedor)
  planoSelecionado: string = 'mensal';
  planos = [
    { id: 'mensal',     label: 'Plano mensal',    preco: 'R$ 39,90/Mês' },
    { id: 'trimestral', label: 'Plano trimestral', preco: 'R$ 99,90' },
    { id: 'anual',      label: 'Plano anual',      preco: 'R$ 112,50' },
  ];
  beneficios = ['Benefício 1', 'Benefício 2', 'Benefício 3', 'Benefício 4'];

  // Step 6 - Cartão (fornecedor)
  nomeCartao: string = '';
  numeroCartao: string = '';
  validadeCartao: string = '';
  ccv: string = '';

  erro: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.perfil = (this.route.snapshot.paramMap.get('perfil') ?? 'cliente') as Perfil;
  }

  get tituloPasso(): string {
    const titulos: Record<number, string> = {
      1: 'CADASTRO',
      2: 'CADASTRO',
      3: 'CADASTRO',
      4: 'PLANOS',
      5: 'PLANOS',
      6: 'PLANOS',
    };
    return titulos[this.step] ?? 'CADASTRO';
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

  onSmsInput(event: Event, index: number) {
    const valor = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 1);
    this.sms[index] = valor;
    if (valor && index < 3) {
      const next = document.getElementById(`sms-${index + 1}`);
      next?.focus();
    }
  }

  toggleSenha() { this.senhaVisivel = !this.senhaVisivel; }
  toggleConfirmarSenha() { this.confirmarSenhaVisivel = !this.confirmarSenhaVisivel; }

  adicionarCartao() {
    this.step = 6;
  }

  voltar() {
    if (this.step === 6) {
      this.step = 5;
      return;
    }
    if (this.step > 1) {
      this.step--;
    } else {
      history.back();
    }
  }

  continuar() {
    this.erro = '';

    if (this.step === 1) {
      if (!this.nome.trim()) { this.erro = 'Informe seu nome.'; return; }
      if (this.telefone.replace(/\D/g, '').length < 10) { this.erro = 'Informe um telefone válido.'; return; }
      if (!this.termosAceitos) { this.erro = 'Aceite os termos para continuar.'; return; }
      this.step = 2;
      return;
    }

    if (this.step === 2) {
      if (this.sms.some(d => !d)) { this.erro = 'Informe o código completo.'; return; }
      this.step = 3;
      return;
    }

    if (this.step === 3) {
      if (this.senha.length < 6) { this.erro = 'A senha deve ter no mínimo 6 caracteres.'; return; }
      if (this.senha !== this.confirmarSenha) { this.erro = 'As senhas não conferem.'; return; }
      if (this.perfil === 'fornecedor') { this.step = 4; return; }
      this.router.navigate(['/cadastro/sucesso']);
      return;
    }

    if (this.step === 4) {
      this.step = 5;
      return;
    }

    if (this.step === 5) {
      this.router.navigate(['/cadastro/sucesso']);
      return;
    }

    if (this.step === 6) {
      if (!this.nomeCartao.trim()) { this.erro = 'Informe o nome do titular.'; return; }
      if (this.numeroCartao.replace(/\D/g, '').length < 16) { this.erro = 'Informe um número de cartão válido.'; return; }
      this.step = 5;
      return;
    }
  }
}