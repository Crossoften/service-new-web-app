import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeliveryService, OpcaoEntrega, OPCOES_ENTREGA, Pedido } from '../../../../core/services/delivery';
import { ProfileService } from '../../../../core/services/profile';
import { ResponseAddressDto } from '../../../../core/models/profile';

@Component({
  selector: 'app-endereco-entrega',
  imports: [CommonModule],
  templateUrl: './endereco-entrega.html',
  styleUrl: './endereco-entrega.scss',
})
export class EnderecoEntregaComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);
  private readonly profileService = inject(ProfileService);

  pedido?: Partial<Pedido>;
  opcoes: OpcaoEntrega[] = OPCOES_ENTREGA;
  opcaoSelecionada = 'padrao';
  endereco = '';
  bairro = '';
  semEndereco = false;

  ngOnInit() {
    this.pedido = this.deliveryService.getPedidoAtual();
    this.deliveryService.setOpcaoEntrega(this.opcoes[0]);
    this.carregarEndereco();
  }

  /** Endereço de entrega = endereço do perfil (Módulo 2). O pedido não recebe endereço na API. */
  private carregarEndereco() {
    this.profileService.me().subscribe({
      next: (p) => this.aplicarEndereco(p.address),
      error: () => (this.semEndereco = true),
    });
  }

  private aplicarEndereco(addr?: ResponseAddressDto) {
    if (!addr || !(addr.street || addr.city)) {
      this.semEndereco = true;
      return;
    }
    const linha1 = [addr.street, addr.number].filter(Boolean).join(', ');
    const linha2 = [addr.neighborhood, [addr.city, addr.state].filter(Boolean).join('/')]
      .filter(Boolean)
      .join(' - ');
    this.endereco = linha1;
    this.bairro = linha2;
    this.deliveryService.setEndereco(this.endereco, this.bairro);
  }

  selecionarOpcao(opcao: OpcaoEntrega) {
    this.opcaoSelecionada = opcao.id;
    this.deliveryService.setOpcaoEntrega(opcao);
  }

  irParaPerfil() {
    this.router.navigate(['/perfil']);
  }

  continuar() {
    this.router.navigate(['/delivery/revisao']);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: number): string {
    if (valor === 0) return 'Grátis';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
