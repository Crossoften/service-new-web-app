import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { TransportService } from '../../../../core/services/transport';
import { TransportationListItemDto } from '../../../../core/models/transportation';
import { ApiError } from '../../../../core/models/common';

type TabTransporte = 'ativos' | 'inativos';

@Component({
  selector: 'app-listagem-transporte-fornecedor',
  imports: [CommonModule],
  templateUrl: './listagem-transporte-fornecedor.html',
  styleUrl: './listagem-transporte-fornecedor.scss',
})
export class ListagemTransporteFornecedorComponent implements OnInit {
  readonly router = inject(Router);
  private readonly service = inject(TransportService);

  tabAtiva: TabTransporte = 'ativos';
  transportes: TransportationListItemDto[] = [];
  carregando = false;
  erro = '';

  tabs: { id: TabTransporte; label: string }[] = [
    { id: 'ativos', label: 'Ativos' },
    { id: 'inativos', label: 'Inativos' },
  ];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.service
      .meusTransportes({ isActive: this.tabAtiva === 'ativos' })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.transportes = page.items),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar seus transportes.';
        },
      });
  }

  trocarTab(tab: TabTransporte) {
    if (this.tabAtiva === tab) return;
    this.tabAtiva = tab;
    this.carregar();
  }

  detalhe(t: TransportationListItemDto): string {
    return [t.model, t.year ? String(t.year) : ''].filter(Boolean).join(' · ');
  }

  formatarPreco(valor: number | string): string {
    return this.service.formatarPreco(valor);
  }

  adicionar() {
    this.router.navigate(['/fornecedor/transporte/criar']);
  }

  abrir(t: TransportationListItemDto) {
    this.router.navigate(['/fornecedor/transporte/criar'], { queryParams: { id: t.id } });
  }

  voltar() {
    this.router.navigate(['/fornecedor']);
  }
}
