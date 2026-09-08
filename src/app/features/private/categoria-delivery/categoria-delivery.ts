import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderBuscaComponent } from '../../../shared/components/header-busca/header-busca';
import { CategoriaGridComponent, CategoriaItem } from '../../../shared/components/categoria-grid/categoria-grid';
import { DeliveryService, Restaurante } from '../../../core/services/delivery';
import { ProfileService } from '../../../core/services/profile';
import { ResponseRestaurantCategoryDto } from '../../../core/models/restaurant';
import { ResponseAddressDto } from '../../../core/models/profile';
import { ApiError } from '../../../core/models/common';
import { Ordenacao, ORDENACOES, filtrarEOrdenarRestaurantes } from '../../../core/utils/restaurant-search';

@Component({
  selector: 'app-categoria-delivery',
  imports: [CommonModule, HeaderBuscaComponent, CategoriaGridComponent],
  templateUrl: './categoria-delivery.html',
  styleUrl: './categoria-delivery.scss',
})
export class CategoriaDeliveryComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);
  private readonly profileService = inject(ProfileService);

  categorias: ResponseRestaurantCategoryDto[] = [];
  items: CategoriaItem[] = [];
  restaurantes: Restaurante[] = []; // todos (para a busca global)
  endereco = ''; // endereço real do cliente (perfil); vazio = "Adicionar endereço"
  carregando = false;
  erro = '';

  // Busca global + filtros (mesma UX da listagem por categoria)
  busca = '';
  filtroAberto = false;
  filtroGratis = false;
  ordenacao: Ordenacao = 'relevancia';
  ordenacaoAberta = false;
  readonly ordenacoes = ORDENACOES;

  ngOnInit() {
    this.carregando = true;
    this.deliveryService.getCategorias().subscribe({
      next: (cats) => {
        this.carregando = false;
        this.categorias = cats ?? [];
        this.items = this.categorias.map((c) => ({ label: c.name, icon: c.iconUrl ?? '' }));
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar as categorias.';
      },
    });
    // Carrega os restaurantes uma vez para a busca global funcionar client-side.
    this.deliveryService.getRestaurantes().subscribe({
      next: (lista) => (this.restaurantes = lista),
      error: () => {},
    });
    // Endereço real do cliente no cabeçalho (sem mock).
    this.profileService.me().subscribe({
      next: (p) => (this.endereco = this.formatarEndereco(p.address)),
      error: () => {},
    });
  }

  private formatarEndereco(a?: ResponseAddressDto): string {
    if (!a?.street?.trim()) return '';
    const rua = a.number?.trim() ? `${a.street}, ${a.number}` : a.street;
    return a.neighborhood?.trim() ? `${rua} - ${a.neighborhood}` : rua;
  }

  /** Há texto na busca? */
  get buscando(): boolean {
    return this.busca.trim().length > 0;
  }

  /** Mostra a lista de restaurantes quando há busca OU algum filtro ativo; senão, o grid. */
  get mostrarResultados(): boolean {
    return this.buscando || this.temFiltroAtivo;
  }

  get resultados(): Restaurante[] {
    return filtrarEOrdenarRestaurantes(this.restaurantes, {
      busca: this.busca,
      aberto: this.filtroAberto,
      gratis: this.filtroGratis,
      ordenacao: this.ordenacao,
    });
  }

  get temFiltroAtivo(): boolean {
    return this.filtroAberto || this.filtroGratis || this.ordenacao !== 'relevancia';
  }

  get ordenacaoLabel(): string {
    return this.ordenacoes.find((o) => o.id === this.ordenacao)?.label ?? 'Relevância';
  }

  onBuscar(valor: string) {
    this.busca = valor;
  }

  toggleAberto() {
    this.filtroAberto = !this.filtroAberto;
  }

  toggleGratis() {
    this.filtroGratis = !this.filtroGratis;
  }

  toggleOrdenacao() {
    this.ordenacaoAberta = !this.ordenacaoAberta;
  }

  selecionarOrdenacao(o: Ordenacao) {
    this.ordenacao = o;
    this.ordenacaoAberta = false;
  }

  limparFiltros() {
    this.filtroAberto = false;
    this.filtroGratis = false;
    this.ordenacao = 'relevancia';
  }

  abrirRestaurante(r: Restaurante) {
    this.deliveryService.setPedidoRestaurante(r);
    this.router.navigate(['/delivery/restaurante', r.id]);
  }

  onItemSelecionado(item: CategoriaItem) {
    const cat = this.categorias.find((c) => c.name === item.label);
    if (cat) {
      this.router.navigate(['/delivery/listagem', cat.id]);
    }
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
