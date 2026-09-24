import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorkService, TrabalhoFornecedor } from '../../../core/services/work';
import { BudgetService, OrcamentoFornecedor } from '../../../core/services/budget';

interface VerticalCard {
  icone: string;
  titulo: string;
  descricao: string;
  rota: string;
}

/**
 * Hub do fornecedor — landing pós-login para `profileType: Supplier`.
 *
 * O contrato trata `Supplier` como genérico e **multi-vertical**. Além do grid de
 * verticais, o hub agora surfaça a **urgência na entrada** (E2E-2a): trabalhos
 * recém-aprovados pelo cliente (Work `Pending`) e orçamentos a responder — cards
 * separados no topo, cada um levando ao lugar certo. Só front (dados já expostos).
 */
@Component({
  selector: 'app-hub-fornecedor',
  imports: [CommonModule],
  templateUrl: './hub-fornecedor.html',
  styleUrl: './hub-fornecedor.scss',
})
export class HubFornecedorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly works = inject(WorkService);
  private readonly budgets = inject(BudgetService);

  trabalhosAprovados = 0;
  orcamentosPendentes = 0;

  verticais: VerticalCard[] = [
    { icone: '🛵', titulo: 'Delivery', descricao: 'Restaurante, cardápio e pedidos', rota: '/fornecedor/home' },
    { icone: '🔧', titulo: 'Serviços', descricao: 'Serviços, orçamentos e trabalhos', rota: '/fornecedor/servicos' },
    { icone: '🛒', titulo: 'Compra e Venda', descricao: 'Anuncie e gerencie produtos', rota: '/compra-vender/meus-produtos' },
    { icone: '🏠', titulo: 'Hospedagem', descricao: 'Cadastre e gerencie acomodações', rota: '/fornecedor/hospedagem' },
    { icone: '🚚', titulo: 'Transporte', descricao: 'Cadastre e gerencie veículos', rota: '/fornecedor/transporte' },
    { icone: '💼', titulo: 'Empregos', descricao: 'Publique vagas e veja candidaturas', rota: '/empregos/minhas-vagas' },
    { icone: '🏘️', titulo: 'Aluguel', descricao: 'Cadastre e gerencie itens para locação', rota: '/fornecedor/aluguel' },
  ];

  ngOnInit() {
    // Trabalho aprovado pelo cliente = Work Received com status Pending (ainda não iniciado).
    this.works.trabalhos().pipe(catchError(() => of([] as TrabalhoFornecedor[]))).subscribe((lista) => {
      this.trabalhosAprovados = lista.filter((t) => t.statusApi === 'Pending').length;
    });
    // Orçamentos recebidos aguardando resposta.
    this.budgets
      .recebidos({ status: 'Pending' })
      .pipe(catchError(() => of([] as OrcamentoFornecedor[])))
      .subscribe((lista) => (this.orcamentosPendentes = lista.length));
  }

  abrir(vertical: VerticalCard) {
    this.router.navigate([vertical.rota]);
  }

  irPerfil() {
    this.router.navigate(['/fornecedor/perfil']);
  }

  irTrabalhos() {
    this.router.navigate(['/fornecedor/servicos/trabalhos']);
  }

  irOrcamentos() {
    this.router.navigate(['/fornecedor/servicos/orcamentos']);
  }

  irAssinaturas() {
    this.router.navigate(['/fornecedor/assinaturas']);
  }
}
