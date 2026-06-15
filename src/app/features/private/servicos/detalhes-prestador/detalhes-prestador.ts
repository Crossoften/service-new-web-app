import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServicosService, Prestador } from '../../../../core/services/servicos';

@Component({
  selector: 'app-detalhes-prestador',
  imports: [CommonModule],
  templateUrl: './detalhes-prestador.html',
  styleUrl: './detalhes-prestador.scss'
})
export class DetalhesPrestadorComponent implements OnInit {
  prestador?: Prestador;

  descricao = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent non porta mauris.
Donec tincidunt dolor a augue ornare pretium. In in leo in magna vehicula pharetra.
Vivamus ac euismod nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Praesent non porta mauris. Donec tincidunt dolor a augue ornare pretium.
In in leo in magna vehicula pharetra. Vivamus ac euismod nisl.`;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicosService: ServicosService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.prestador = this.servicosService.getPrestador(id);
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