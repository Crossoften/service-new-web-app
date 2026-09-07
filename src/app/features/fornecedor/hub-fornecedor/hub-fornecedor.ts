import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface VerticalCard {
  icone: string;
  titulo: string;
  descricao: string;
  rota: string;
}

/**
 * Hub do fornecedor — landing pós-login para `profileType: Supplier`.
 *
 * O contrato trata `Supplier` como genérico e **multi-vertical** (não há campo que
 * diferencie "fornecedor delivery" dos demais). Por isso o fornecedor escolhe aqui
 * qual vertical gerenciar, em vez de cair direto na home de delivery/restaurante.
 */
@Component({
  selector: 'app-hub-fornecedor',
  imports: [CommonModule],
  templateUrl: './hub-fornecedor.html',
  styleUrl: './hub-fornecedor.scss',
})
export class HubFornecedorComponent {
  private readonly router = inject(Router);

  verticais: VerticalCard[] = [
    { icone: '🛵', titulo: 'Delivery', descricao: 'Restaurante, cardápio e pedidos', rota: '/fornecedor/home' },
    { icone: '🔧', titulo: 'Serviços', descricao: 'Serviços, orçamentos e trabalhos', rota: '/fornecedor/servicos' },
    { icone: '🛒', titulo: 'Compra e Venda', descricao: 'Anuncie e gerencie produtos', rota: '/compra-vender/meus-produtos' },
    { icone: '🏠', titulo: 'Hospedagem', descricao: 'Cadastre e gerencie acomodações', rota: '/fornecedor/hospedagem' },
    { icone: '🚚', titulo: 'Transporte', descricao: 'Cadastre e gerencie veículos', rota: '/fornecedor/transporte' },
    { icone: '💼', titulo: 'Empregos', descricao: 'Publique vagas e veja candidaturas', rota: '/empregos/vaga/nova' },
    { icone: '🏘️', titulo: 'Aluguel', descricao: 'Cadastre e gerencie itens para locação', rota: '/fornecedor/aluguel' },
  ];

  abrir(vertical: VerticalCard) {
    this.router.navigate([vertical.rota]);
  }

  irPerfil() {
    this.router.navigate(['/fornecedor/perfil']);
  }
}
