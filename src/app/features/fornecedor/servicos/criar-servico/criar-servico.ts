import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FornecedorServicosService } from '../../../../core/services/fornecedor-servicos';

@Component({
  selector: 'app-criar-servico',
  imports: [CommonModule, FormsModule],
  templateUrl: './criar-servico.html',
  styleUrl: './criar-servico.scss'
})
export class CriarServicoComponent implements OnInit {
  modoEdicao: boolean = false;
  servicoId?: number;

  categoria: string = '';
  nome: string = '';
  tipo: string = 'Online';
  registro: string = '';
  valor: string = '';
  descricao: string = '';
  imagem: string = '';
  bloqueado: boolean = false;
  tipoAberto: boolean = false;
  erro: string = '';

  tipos = ['Online', 'Presencial', 'Híbrido'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fornecedorServicosService: FornecedorServicosService
  ) {}

  ngOnInit() {
    this.categoria = this.fornecedorServicosService.getCategoria();

    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.modoEdicao = true;
      this.servicoId = Number(id);
      const servico = this.fornecedorServicosService.getServico(this.servicoId);
      if (servico) {
        this.nome = servico.nome;
        this.tipo = servico.tipo;
        this.registro = servico.registro;
        this.valor = servico.valor.toString();
        this.descricao = servico.descricao;
        this.imagem = servico.imagem;
        this.bloqueado = servico.bloqueado;
        this.categoria = servico.categoria;
      }
    }
  }

  toggleTipo() { this.tipoAberto = !this.tipoAberto; }

  selecionarTipo(tipo: string) {
    this.tipo = tipo;
    this.tipoAberto = false;
  }

  adicionarImagem() {
    // Futuramente: abrir file picker
  }

  criarServico() {
    this.erro = '';
    if (!this.nome.trim()) { this.erro = 'Informe o nome do serviço.'; return; }
    if (!this.valor || isNaN(Number(this.valor))) { this.erro = 'Informe um valor válido.'; return; }

    this.fornecedorServicosService.salvarServico({
      id: this.servicoId,
      categoria: this.categoria,
      nome: this.nome,
      tipo: this.tipo,
      registro: this.registro,
      valor: Number(this.valor),
      descricao: this.descricao,
      imagem: this.imagem,
    });

    this.router.navigate(['/fornecedor/servicos']);
  }

  voltar() {
    history.back();
  }
}