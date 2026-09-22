import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DeliveryService, Pedido, FormaPagamento, ItemPedido } from '../../../../core/services/delivery';
import { CouponService } from '../../../../core/services/coupon';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-sacola',
  imports: [CommonModule, FormsModule],
  templateUrl: './sacola.html',
  styleUrl: './sacola.scss'
})
export class SacolaComponent implements OnInit {
  private readonly coupons = inject(CouponService);

  pedido?: Partial<Pedido>;
  formaPagamentoAberta: boolean = false;
  formaSelecionada: FormaPagamento = 'credito';

  // Gorjeta (§8.9)
  gorjetasSugeridas = [0, 2, 5, 10];
  gorjetaSelecionada = 0;
  gorjetaCustom = '';

  // Cupom (§8.9) — prévia; o back recalcula na criação do pedido
  cupomCodigo = '';
  validandoCupom = false;
  cupomErro = '';

  formasPagamento: { id: FormaPagamento; label: string; icone: string }[] = [
    { id: 'credito',  label: 'Cartão de Crédito', icone: 'card' },
    { id: 'debito',   label: 'Cartão de Débito',  icone: 'card' },
    { id: 'pix',      label: 'PIX',               icone: 'pix' },
    { id: 'boleto',   label: 'Boleto',            icone: 'card' },
    { id: 'dinheiro', label: 'Dinheiro',          icone: 'cash' },
  ];

  constructor(
    private router: Router,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit() {
    this.pedido = this.deliveryService.getPedidoAtual();
  }

  get itens(): ItemPedido[] {
    return this.pedido?.itens ?? [];
  }

  /** Subtotal da linha: (preço do item + adicionais) × quantidade. */
  subtotalItem(ip: ItemPedido): number {
    const extras = ip.adicionaisSelecionados.reduce((acc, a) => acc + a.preco, 0);
    return (ip.item.preco + extras) * ip.quantidade;
  }

  incrementar(index: number) {
    this.deliveryService.alterarQuantidade(index, 1);
  }

  decrementar(index: number) {
    this.deliveryService.alterarQuantidade(index, -1);
  }

  remover(index: number) {
    this.deliveryService.removerItem(index);
    this.pedido = this.deliveryService.getPedidoAtual();
  }

  get formaSelecionadaLabel(): string {
    return this.formasPagamento.find(f => f.id === this.formaSelecionada)?.label ?? '';
  }

  togglePagamento() {
    this.formaPagamentoAberta = !this.formaPagamentoAberta;
  }

  selecionarForma(forma: FormaPagamento) {
    this.formaSelecionada = forma;
    this.deliveryService.setFormaPagamento(forma);
    this.formaPagamentoAberta = false;
  }

  // ── Gorjeta ────────────────────────────────────────────────────────────────

  selecionarGorjeta(valor: number) {
    this.gorjetaSelecionada = valor;
    this.gorjetaCustom = '';
    this.deliveryService.setGorjeta(valor);
  }

  onGorjetaCustom(texto: string) {
    // Aceita só dígitos e vírgula/ponto; vira número em reais.
    const limpo = texto.replace(/[^\d.,]/g, '').replace(',', '.');
    this.gorjetaCustom = texto;
    const valor = Number(limpo);
    this.gorjetaSelecionada = -1; // marca "personalizada"
    this.deliveryService.setGorjeta(Number.isFinite(valor) ? valor : 0);
  }

  get gorjeta(): number {
    return this.pedido?.gorjeta ?? 0;
  }

  // ── Cupom (prévia) ───────────────────────────────────────────────────────────

  aplicarCupom() {
    const codigo = this.cupomCodigo.trim();
    if (!codigo || this.validandoCupom) return;
    const restaurantId = this.pedido?.restaurante?.id;
    if (!restaurantId) return;
    this.validandoCupom = true;
    this.cupomErro = '';
    this.coupons
      .validar({ code: codigo, restaurantId, itemsValue: this.subtotal })
      .pipe(finalize(() => (this.validandoCupom = false)))
      .subscribe({
        next: (previa) =>
          this.deliveryService.setCupom({
            codigo: previa.codigo || codigo,
            desconto: previa.desconto,
            descricao: previa.descricao,
          }),
        error: (err: ApiError) => {
          this.deliveryService.setCupom(undefined);
          // A API já diz se é inexistente, fora da validade, abaixo do mínimo, ou de outro restaurante.
          this.cupomErro = err?.message?.trim() ? err.message : 'Cupom inválido.';
        },
      });
  }

  removerCupom() {
    this.cupomCodigo = '';
    this.cupomErro = '';
    this.deliveryService.setCupom(undefined);
  }

  get cupom() {
    return this.pedido?.cupom;
  }

  continuar() {
    if (!this.itens.length) return;
    this.deliveryService.setFormaPagamento(this.formaSelecionada);
    this.router.navigate(['/delivery/endereco']);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  get subtotal(): number {
    return this.deliveryService.calcularSubtotal();
  }

  get total(): number {
    return this.deliveryService.calcularTotal();
  }
}