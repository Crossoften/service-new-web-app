import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService, Restaurante } from '../../../../core/services/delivery';
import { ProfileService } from '../../../../core/services/profile';
import { ResponseAddressDto } from '../../../../core/models/profile';
import { HeaderBuscaComponent } from '../../../../shared/components/header-busca/header-busca';
import { ApiError } from '../../../../core/models/common';

type Ordenacao = 'relevancia' | 'avaliacao' | 'taxa' | 'tempo';

@Component({
  selector: 'app-listagem-delivery',
  imports: [CommonModule, FormsModule, HeaderBuscaComponent],
  templateUrl: './listagem-delivery.html',
  styleUrl: './listagem-delivery.scss',
})
export class ListagemDeliveryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);
  private readonly profileService = inject(ProfileService);

  categoryId: number | null = null;
  restaurantes: Restaurante[] = [];
  endereco = ''; // endereço real do cliente (perfil); vazio = "Adicionar endereço"
  busca = '';
  carregando = false;
  erro = '';

  // Filtros e ordenação
  filtroAberto = false; // só abertos agora
  filtroGratis = false; // só entrega grátis
  ordenacao: Ordenacao = 'relevancia';
  ordenacaoAberta = false;

  readonly ordenacoes: { id: Ordenacao; label: string }[] = [
    { id: 'relevancia', label: 'Relevância' },
    { id: 'avaliacao', label: 'Melhor avaliação' },
    { id: 'taxa', label: 'Menor taxa de entrega' },
    { id: 'tempo', label: 'Menor tempo de entrega' },
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('categoria'));
    this.categoryId = Number.isFinite(id) && id > 0 ? id : null;
    this.carregar();
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

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.deliveryService.getRestaurantes(this.categoryId ?? undefined).subscribe({
      next: (lista) => {
        this.carregando = false;
        this.restaurantes = lista;
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os restaurantes.';
      },
    });
  }

  get restaurantesFiltrados(): Restaurante[] {
    const termo = this.busca.trim().toLowerCase();
    const lista = this.restaurantes.filter((r) => {
      if (termo && !r.nome.toLowerCase().includes(termo)) return false;
      if (this.filtroAberto && !r.aberto) return false;
      if (this.filtroGratis && r.taxaEntrega > 0) return false;
      return true;
    });
    return this.ordenar(lista);
  }

  /** Ordena sem mutar a lista original. `relevancia` mantém a ordem do back. */
  private ordenar(lista: Restaurante[]): Restaurante[] {
    switch (this.ordenacao) {
      case 'avaliacao':
        return [...lista].sort((a, b) => b.avaliacao - a.avaliacao);
      case 'taxa':
        return [...lista].sort((a, b) => a.taxaEntrega - b.taxaEntrega);
      case 'tempo':
        return [...lista].sort(
          (a, b) => (a.tempoMinMinutos ?? Infinity) - (b.tempoMinMinutos ?? Infinity),
        );
      default:
        return lista;
    }
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

  abrirRestaurante(restaurante: Restaurante) {
    this.deliveryService.setPedidoRestaurante(restaurante);
    this.router.navigate(['/delivery/restaurante', restaurante.id]);
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
