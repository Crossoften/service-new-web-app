import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeliveryService, OpcaoEntrega, OPCOES_ENTREGA } from '../../../../core/services/delivery';

@Component({
  selector: 'app-endereco-entrega',
  imports: [CommonModule],
  templateUrl: './endereco-entrega.html',
  styleUrl: './endereco-entrega.scss'
})
export class EnderecoEntregaComponent implements OnInit {
  pedido: any;
  opcoes: OpcaoEntrega[] = OPCOES_ENTREGA;
  opcaoSelecionada: string = 'padrao';
  endereco: string = 'Rua tuiucue, 122';
  bairro: string = 'Jardim da Saúde';

  constructor(
    private router: Router,
    private deliveryService: DeliveryService
  ) {}

ngOnInit() {
  this.pedido = this.deliveryService.getPedidoAtual();
  this.deliveryService.setEndereco(this.endereco, this.bairro);
  this.deliveryService.setOpcaoEntrega(this.opcoes[0]);
}

  selecionarOpcao(opcao: OpcaoEntrega) {
    this.opcaoSelecionada = opcao.id;
    this.deliveryService.setOpcaoEntrega(opcao);
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