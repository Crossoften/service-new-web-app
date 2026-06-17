import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FornecedorService, PedidoFornecedor, StatusPedidoFornecedor } from '../../../core/services/fornecedor';

@Component({
  selector: 'app-detalhes-pedido-fornecedor',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalhes-pedido-fornecedor.html',
  styleUrl: './detalhes-pedido-fornecedor.scss'
})
export class DetalhesPedidoFornecedorComponent implements OnInit {
  pedido?: PedidoFornecedor;
  statusAberto: boolean = false;

  statusOpcoes: { id: StatusPedidoFornecedor; label: string }[] = [
    { id: 'recebido',  label: 'Recebido' },
    { id: 'preparo',   label: 'Em preparo' },
    { id: 'caminho',   label: 'A caminho' },
    { id: 'entregue',  label: 'Entregue' },
    { id: 'cancelado', label: 'Cancelado' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fornecedorService: FornecedorService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pedido = this.fornecedorService.getPedido(id);
  }

  get statusAtualLabel(): string {
    return this.statusOpcoes.find(s => s.id === this.pedido?.status)?.label ?? '';
  }

  toggleStatus() {
    this.statusAberto = !this.statusAberto;
  }

  selecionarStatus(status: StatusPedidoFornecedor) {
    if (this.pedido) {
      this.pedido.status = status;
      this.fornecedorService.atualizarStatus(this.pedido.id, status);
    }
    this.statusAberto = false;
  }

  salvar() {
    this.router.navigate(['/fornecedor/home']);
  }

  cancelar() {
    history.back();
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}