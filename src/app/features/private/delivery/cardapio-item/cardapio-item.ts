import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeliveryService, ItemCardapio, Adicional } from '../../../../core/services/delivery';

@Component({
  selector: 'app-cardapio-item',
  imports: [CommonModule],
  templateUrl: './cardapio-item.html',
  styleUrl: './cardapio-item.scss'
})
export class CardapioItemComponent implements OnInit {
  item?: ItemCardapio;
  restauranteId?: number;
  quantidade: number = 1;
  adicionais: Adicional[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit() {
    const itemId = Number(this.route.snapshot.paramMap.get('id'));
    this.restauranteId = Number(this.route.snapshot.queryParamMap.get('restauranteId'));
    this.item = this.deliveryService.getItem(this.restauranteId, itemId);
    this.adicionais = this.item?.adicionais.map(a => ({ ...a, selecionado: false })) ?? [];
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
    const extras = this.adicionais
      .filter(a => a.selecionado)
      .reduce((acc, a) => acc + a.preco, 0);
    return ((this.item?.preco ?? 0) + extras) * this.quantidade;
  }

  adicionar() {
    const selecionados = this.adicionais.filter(a => a.selecionado);
    this.deliveryService.addItem(this.item!, this.quantidade, selecionados);
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