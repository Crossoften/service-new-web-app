import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StatusPedido } from '../../../../core/services/delivery';

interface EtapaStatus {
  id: StatusPedido;
  label: string;
}

@Component({
  selector: 'app-status-pedido',
  imports: [CommonModule],
  templateUrl: './status-pedido.html',
  styleUrl: './status-pedido.scss'
})
export class StatusPedidoComponent implements OnInit, OnDestroy {
  pedidoId: number = 0;
  statusAtual: StatusPedido = 'recebido';
  private intervalo?: ReturnType<typeof setInterval>;

  etapas: EtapaStatus[] = [
    { id: 'recebido', label: 'Pedido recebido' },
    { id: 'preparo',  label: 'Em preparo' },
    { id: 'caminho',  label: 'A caminho' },
    { id: 'entregue', label: 'Entregue' },
  ];

  endereco = 'Rua tuiucue, 122';
  bairro = 'Jardim da Saúde';

  // Mock de dados do pedido para exibição
  restauranteNome = 'Pizzaria Bella Itália';
  restauranteAvaliacao = 4.7;
  restauranteTempo = '35-45 min';
  restauranteTaxaEntrega = 4.99;
  restauranteDescricao = 'Pizzas artesanais feitas no forno a lenha com massa crocante';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    this.simularProgresso();
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  get indexAtual(): number {
    return this.etapas.findIndex(e => e.id === this.statusAtual);
  }

  get labelAtual(): string {
    return this.etapas.find(e => e.id === this.statusAtual)?.label ?? '';
  }

  simularProgresso() {
    // Simula mudança de status a cada 5 segundos para demo
    this.intervalo = setInterval(() => {
      const index = this.indexAtual;
      if (index < this.etapas.length - 1) {
        this.statusAtual = this.etapas[index + 1].id;
      } else {
        clearInterval(this.intervalo);
      }
    }, 5000);
  }

  etapaAtingida(index: number): boolean {
    return index <= this.indexAtual;
  }

  ajuda() {
    // implementar depois
  }

  voltar() {
    this.router.navigate(['/home']);
  }
}