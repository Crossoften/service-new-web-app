import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntregadorService, AtividadeEntregador } from '../../../core/services/entregador';
import { BottomNavEntregadorComponent } from '../../../shared/components/bottom-nav-entregador/bottom-nav-entregador';

@Component({
  selector: 'app-trabalhos-entregador',
  imports: [CommonModule, FormsModule, BottomNavEntregadorComponent],
  templateUrl: './trabalhos-entregador.html',
  styleUrl: './trabalhos-entregador.scss'
})
export class TrabalhosEntregadorComponent implements OnInit {
  atividades: AtividadeEntregador[] = [];
  busca: string = '';
  faturamento: any;

  constructor(
    public router: Router,
    private entregadorService: EntregadorService
  ) {}

  ngOnInit() {
    this.atividades = this.entregadorService.getAtividades();
    this.faturamento = this.entregadorService.getFaturamento();
  }

  get atividadesFiltradas(): AtividadeEntregador[] {
    if (!this.busca.trim()) return this.atividades;
    return this.atividades.filter(a =>
      a.restaurante.toLowerCase().includes(this.busca.toLowerCase()) ||
      a.numero.includes(this.busca)
    );
  }

  formatarPreco(valor: number): string {
    return this.entregadorService.formatarPreco(valor);
  }

  voltar() {
    history.back();
  }
}