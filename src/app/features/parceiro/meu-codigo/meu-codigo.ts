import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { BottomNavParceiroComponent } from '../../../shared/components/bottom-nav-parceiro/bottom-nav-parceiro';
import { ProfileService } from '../../../core/services/profile';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-meu-codigo',
  imports: [CommonModule, BottomNavParceiroComponent],
  templateUrl: './meu-codigo.html',
  styleUrl: './meu-codigo.scss',
})
export class MeuCodigoComponent implements OnInit {
  private readonly profile = inject(ProfileService);

  codigo = '';
  link = '';
  linkCopiado = false;
  carregando = false;
  erro = '';

  ngOnInit() {
    this.carregando = true;
    this.profile
      .me()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (p) => {
          this.codigo = p.referralCode?.trim() ?? '';
          this.link = this.montarLink(this.codigo);
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar seu código.';
        },
      });
  }

  /** Link de indicação: cadastro do app carregando o `referralCode` via `?ref=`. */
  private montarLink(codigo: string): string {
    if (!codigo) return '';
    const origin = typeof location !== 'undefined' ? location.origin : '';
    return `${origin}/cadastro/cliente?ref=${encodeURIComponent(codigo)}`;
  }

  copiarLink() {
    if (!this.link) return;
    navigator.clipboard?.writeText(this.link);
    this.linkCopiado = true;
    setTimeout(() => (this.linkCopiado = false), 2000);
  }

  compartilhar() {
    if (this.link && navigator.share) {
      navigator.share({
        title: 'Service App',
        text: 'Cadastre-se com meu código de indicação',
        url: this.link,
      });
    }
  }
}
