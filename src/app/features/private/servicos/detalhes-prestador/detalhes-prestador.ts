import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { Prestador, ServiceCatalogService } from '../../../../core/services/service-catalog';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-detalhes-prestador',
  imports: [CommonModule],
  templateUrl: './detalhes-prestador.html',
  styleUrl: './detalhes-prestador.scss',
})
export class DetalhesPrestadorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(ServiceCatalogService);

  prestador?: Prestador;
  carregando = false;
  erro = '';
  descricao = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.carregando = true;
    this.catalog
      .prestador(id)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (p) => {
          this.prestador = p;
          this.descricao = p.descricao;
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o prestador.';
        },
      });
  }

  /** Solicita orçamento deste prestador (leva para os requisitos). */
  solicitarOrcamento() {
    if (this.prestador) {
      this.router.navigate(['/servicos/requisitos'], { queryParams: { ids: this.prestador.id } });
    }
  }

  voltar() {
    history.back();
  }

  abrirChat() {
    this.router.navigate(['/servicos/chat', this.prestador?.id]);
  }

  abrirNotificacoes() {
    // implementar depois
  }
}
