import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicosService, Prestador } from '../../../../core/services/servicos';

@Component({
  selector: 'app-listagem-servicos',
  imports: [CommonModule, FormsModule],
  templateUrl: './listagem-servicos.html',
  styleUrl: './listagem-servicos.scss'
})
export class ListagemServicosComponent implements OnInit {
  categoria: string = '';
  prestadores: Prestador[] = [];
  busca: string = '';
  selecionarTodos: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicosService: ServicosService
  ) {}

  ngOnInit() {
    this.categoria = this.route.snapshot.paramMap.get('categoria') ?? '';
    this.prestadores = this.servicosService.getPrestadores(this.categoria);
  }

  get prestadoresFiltrados(): Prestador[] {
    if (!this.busca.trim()) return this.prestadores;
    return this.prestadores.filter(p =>
      p.nome.toLowerCase().includes(this.busca.toLowerCase()) ||
      p.profissao.toLowerCase().includes(this.busca.toLowerCase())
    );
  }

  toggleTodos() {
    this.selecionarTodos = !this.selecionarTodos;
    this.prestadores.forEach(p => p.selecionado = this.selecionarTodos);
  }

  togglePrestador(prestador: Prestador) {
    prestador.selecionado = !prestador.selecionado;
    this.selecionarTodos = this.prestadores.every(p => p.selecionado);
  }

  abrirDetalhes(prestador: Prestador, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/servicos/prestador', prestador.id]);
  }

  get algumSelecionado(): boolean {
    return this.prestadores.some(p => p.selecionado);
  }

  confirmar() {
    const selecionados = this.prestadores.filter(p => p.selecionado);
    this.servicosService.setSelecionados(selecionados);
    this.router.navigate(['/servicos/requisitos']);
  }

  voltar() {
    history.back();
  }
}