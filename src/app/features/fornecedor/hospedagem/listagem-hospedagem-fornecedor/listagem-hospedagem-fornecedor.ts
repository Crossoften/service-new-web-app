import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { AccommodationService } from '../../../../core/services/accommodation';
import { AccommodationListItemDto } from '../../../../core/models/accommodation';
import { ApiError } from '../../../../core/models/common';

type TabHospedagem = 'ativas' | 'inativas';

@Component({
  selector: 'app-listagem-hospedagem-fornecedor',
  imports: [CommonModule],
  templateUrl: './listagem-hospedagem-fornecedor.html',
  styleUrl: './listagem-hospedagem-fornecedor.scss',
})
export class ListagemHospedagemFornecedorComponent implements OnInit {
  readonly router = inject(Router);
  private readonly service = inject(AccommodationService);

  tabAtiva: TabHospedagem = 'ativas';
  acomodacoes: AccommodationListItemDto[] = [];
  carregando = false;
  erro = '';

  tabs: { id: TabHospedagem; label: string }[] = [
    { id: 'ativas', label: 'Ativas' },
    { id: 'inativas', label: 'Inativas' },
  ];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.service
      .minhasAcomodacoes({ isActive: this.tabAtiva === 'ativas' })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.acomodacoes = page.items),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar suas hospedagens.';
        },
      });
  }

  trocarTab(tab: TabHospedagem) {
    if (this.tabAtiva === tab) return;
    this.tabAtiva = tab;
    this.carregar();
  }

  local(a: AccommodationListItemDto): string {
    return [a.city, a.state].filter(Boolean).join(' · ');
  }

  formatarPreco(valor: number | string): string {
    return this.service.formatarPreco(valor);
  }

  adicionar() {
    this.router.navigate(['/fornecedor/hospedagem/criar']);
  }

  abrir(a: AccommodationListItemDto) {
    this.router.navigate(['/fornecedor/hospedagem/criar'], { queryParams: { id: a.id } });
  }

  voltar() {
    this.router.navigate(['/fornecedor']);
  }
}
