import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FornecedorServicosService, OrcamentoFornecedor } from '../../../../core/services/fornecedor-servicos';

@Component({
  selector: 'app-fazer-orcamento',
  imports: [CommonModule, FormsModule],
  templateUrl: './fazer-orcamento.html',
  styleUrl: './fazer-orcamento.scss'
})
export class FazerOrcamentoComponent implements OnInit {
  orcamento?: OrcamentoFornecedor;
  mostrarModalMaisInfos: boolean = false;

  // Previsão
  dataInicio: string = '';
  diasPrevistos: string = '7 dias';
  diasAberto: boolean = false;
  diasOpcoes = ['3 dias', '7 dias', '15 dias', '30 dias', '60 dias'];

  // Detalhes
  valor: string = '';
  formaPagamento: string = 'Parcelado/Tipo pag';
  pagamentoAberto: boolean = false;
  formasPagamento = ['À vista', 'Parcelado/Tipo pag', 'PIX', 'Boleto'];

  // Garantia
  garantia: string = '6 meses';

  // Descrição
  descricao: string = '';

  // Mais informações
  maisInfosDescricao: string = '';
  maisInfosArquivos = [
    { id: 1, nome: 'ARQUIVO.PDF', tipo: 'pdf' },
    { id: 2, nome: 'ARQUIVO.MP3', tipo: 'mp3' },
    { id: 3, nome: 'ARQUIVO.MP4', tipo: 'mp4' },
  ];

  erro: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fornecedorServicosService: FornecedorServicosService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orcamento = this.fornecedorServicosService.getOrcamento(id);
  }

  toggleDias() { this.diasAberto = !this.diasAberto; this.pagamentoAberto = false; }
  togglePagamento() { this.pagamentoAberto = !this.pagamentoAberto; this.diasAberto = false; }

  selecionarDias(dias: string) { this.diasPrevistos = dias; this.diasAberto = false; }
  selecionarPagamento(forma: string) { this.formaPagamento = forma; this.pagamentoAberto = false; }

  abrirMaisInfos() { this.mostrarModalMaisInfos = true; }
  fecharMaisInfos() { this.mostrarModalMaisInfos = false; }

  confirmarMaisInfos() {
    this.mostrarModalMaisInfos = false;
    // Futuramente: enviar solicitação de mais informações ao cliente
  }

  adicionarArquivoMaisInfos() {
    // Futuramente: abrir file picker
  }

  enviar() {
    this.erro = '';
    if (!this.valor || isNaN(Number(this.valor))) { this.erro = 'Informe um valor válido.'; return; }
    if (!this.dataInicio) { this.erro = 'Informe a data de início.'; return; }
    this.router.navigate(['/fornecedor/servicos/trabalhos']);
  }

  voltar() {
    history.back();
  }
}