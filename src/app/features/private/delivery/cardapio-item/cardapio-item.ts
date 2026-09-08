import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService, ItemCardapio, Adicional } from '../../../../core/services/delivery';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-cardapio-item',
  imports: [CommonModule, FormsModule],
  templateUrl: './cardapio-item.html',
  styleUrl: './cardapio-item.scss',
})
export class CardapioItemComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);

  item?: ItemCardapio;
  restauranteId = 0;
  quantidade = 1;
  adicionais: Adicional[] = [];
  observacao = '';
  carregando = false;
  erro = '';

  ngOnInit() {
    const itemId = Number(this.route.snapshot.paramMap.get('id'));
    this.restauranteId = Number(this.route.snapshot.queryParamMap.get('restauranteId'));
    this.carregando = true;
    this.deliveryService.getItem(this.restauranteId, itemId).subscribe({
      next: (item) => {
        this.carregando = false;
        this.item = item;
        this.adicionais = item?.adicionais.map((a) => ({ ...a, selecionado: false })) ?? [];
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o item.';
      },
    });
  }

  toggleAdicional(adicional: Adicional) {
    adicional.selecionado = !adicional.selecionado;
  }

  decrementar() {
    if (this.quantidade > 1) this.quantidade--;
  }

  incrementar() {
    this.quantidade++;
  }

  get totalPreco(): number {
    const extras = this.adicionais.filter((a) => a.selecionado).reduce((acc, a) => acc + a.preco, 0);
    return ((this.item?.preco ?? 0) + extras) * this.quantidade;
  }

  adicionar() {
    if (!this.item) return;
    const selecionados = this.adicionais.filter((a) => a.selecionado);
    this.deliveryService.addItem(this.item, this.quantidade, selecionados, this.observacao.trim() || undefined);
    this.router.navigate(['/delivery/sacola']);
  }

  voltar() {
    history.back();
  }

  abrirSacola() {
    this.router.navigate(['/delivery/sacola']);
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
