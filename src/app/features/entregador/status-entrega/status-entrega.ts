import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EntregadorService, StatusEntrega, PedidoEntregador } from '../../../core/services/entregador';

interface EtapaEntrega {
  id: StatusEntrega;
  label: string;
}

@Component({
  selector: 'app-status-entrega',
  imports: [CommonModule],
  templateUrl: './status-entrega.html',
  styleUrl: './status-entrega.scss'
})
export class StatusEntregaComponent implements OnInit {
  pedido?: PedidoEntregador;
  statusAtual: StatusEntrega = 'caminho';

  etapas: EtapaEntrega[] = [
    { id: 'caminho',           label: 'A caminho' },
    { id: 'retirado',          label: 'Pedido retirado' },
    { id: 'a_caminho_cliente', label: 'A caminho' },
    { id: 'entregue',          label: 'Entregue' },
  ];

  botoes: Record<StatusEntrega, string> = {
    caminho:           'CONFIRMAR A CHEGADA',
    retirado:          'A CAMINHO DO CLIENTE',
    a_caminho_cliente: 'ENTREGUE',
    entregue:          'CONCLUÍDO',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entregadorService: EntregadorService
  ) {}

  ngOnInit() {
    this.pedido = this.entregadorService.getPedidoAtivo() ?? undefined;
    this.statusAtual = this.entregadorService.getStatusAtual();
  }

  get indexAtual(): number {
    return this.etapas.findIndex(e => e.id === this.statusAtual);
  }

  get labelAtual(): string {
    return this.etapas.find(e => e.id === this.statusAtual)?.label ?? '';
  }

  get labelBotao(): string {
    return this.botoes[this.statusAtual];
  }

  etapaAtingida(index: number): boolean {
    return index <= this.indexAtual;
  }

  avancar() {
    if (this.statusAtual === 'entregue') {
      this.router.navigate(['/entregador/home']);
      return;
    }
    this.statusAtual = this.entregadorService.avancarStatus();
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: number): string {
    return this.entregadorService.formatarPreco(valor);
  }
}