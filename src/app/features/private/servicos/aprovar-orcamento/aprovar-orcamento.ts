import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServicosService, Orcamento } from '../../../../core/services/servicos';

@Component({
  selector: 'app-aprovar-orcamento',
  imports: [CommonModule],
  templateUrl: './aprovar-orcamento.html',
  styleUrl: './aprovar-orcamento.scss'
})
export class AprovarOrcamentoComponent implements OnInit {
  orcamento?: Orcamento;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicosService: ServicosService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orcamento = this.servicosService.getOrcamento(id);
  }

  solicitar() {
    this.router.navigate(['/servicos/solicitacoes']);
  }

  voltar() {
    history.back();
  }

  abrirChat() {}
  abrirNotificacoes() {}

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}