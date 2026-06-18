import { Injectable } from '@angular/core';

// ─── Interfaces (prontas para integração com API) ───────────────────────────

export interface ServicoFornecedor {
  id: number;
  categoria: string;
  nome: string;
  tipo: string;
  registro: string;
  valor: number;
  descricao: string;
  imagem: string;
  ativo: boolean;
  bloqueado: boolean;
}

export type StatusTrabalho = 'em_andamento' | 'em_garantia' | 'finalizado' | 'cancelado';

export interface TrabalhoFornecedor {
  id: number;
  cliente: string;
  clienteFoto: string;
  descricao: string;
  status: StatusTrabalho;
  validadeGarantia?: string;
  realizado: string;
  valorServico: number;
  total: number;
  arquivosCliente: { nome: string; tipo: string }[];
}

export type StatusOrcamentoFornecedor = 'todos' | 'respondidos' | 'nao_respondidos';

export interface OrcamentoFornecedor {
  id: number;
  cliente: string;
  clienteFoto: string;
  descricao: string;
  distancia: string;
  arquivos: { nome: string; tipo: string }[];
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const SERVICOS_MOCK: ServicoFornecedor[] = [
  {
    id: 1,
    categoria: 'Pedreiro',
    nome: 'Reforma completa',
    tipo: 'Presencial',
    registro: 'CREA 12345',
    valor: 150.00,
    descricao: 'Lorem ipsum dolor sit amet,',
    imagem: '',
    ativo: true,
    bloqueado: false,
  },
  {
    id: 2,
    categoria: 'Pedreiro',
    nome: 'Pequenos reparos',
    tipo: 'Presencial',
    registro: 'CREA 12345',
    valor: 80.00,
    descricao: 'Lorem ipsum dolor sit amet,',
    imagem: '',
    ativo: true,
    bloqueado: false,
  },
  {
    id: 3,
    categoria: 'Pedreiro',
    nome: 'Serviço bloqueado',
    tipo: 'Online',
    registro: '',
    valor: 0,
    descricao: '',
    imagem: '',
    ativo: false,
    bloqueado: true,
  },
];

const TRABALHOS_MOCK: TrabalhoFornecedor[] = [
  {
    id: 1,
    cliente: 'Susana Vieira',
    clienteFoto: '',
    descricao: 'Lorem Ipsum Dolor Sit Amet, Consectetur Lorem Ipsum Dolor Sit',
    status: 'em_andamento',
    realizado: '00/00/0000',
    valorServico: 0,
    total: 0,
    arquivosCliente: [
      { nome: 'ARQUIVO.PDF', tipo: 'pdf' },
      { nome: 'ARQUIVO.MP3', tipo: 'mp3' },
      { nome: 'ARQUIVO.MP4', tipo: 'mp4' },
    ],
  },
  {
    id: 2,
    cliente: 'Susana Vieira',
    clienteFoto: '',
    descricao: 'Lorem Ipsum Dolor Sit Amet, Consectetur Lorem Ipsum Dolor Sit',
    status: 'em_garantia',
    validadeGarantia: '00/00/00',
    realizado: '00/00/0000',
    valorServico: 0,
    total: 0,
    arquivosCliente: [
      { nome: 'ARQUIVO.PDF', tipo: 'pdf' },
      { nome: 'ARQUIVO.MP3', tipo: 'mp3' },
      { nome: 'ARQUIVO.MP4', tipo: 'mp4' },
    ],
  },
  {
    id: 3,
    cliente: 'Susana Vieira',
    clienteFoto: '',
    descricao: 'Lorem Ipsum Dolor Sit Amet, Consectetur Lorem Ipsum Dolor Sit',
    status: 'em_andamento',
    realizado: '00/00/0000',
    valorServico: 0,
    total: 0,
    arquivosCliente: [],
  },
];

const ORCAMENTOS_MOCK: OrcamentoFornecedor[] = [
  {
    id: 1,
    cliente: 'Susana Vieira',
    clienteFoto: '',
    descricao: 'Lorem Ipsum Dolor Sit Amet,',
    distancia: '10km',
    arquivos: [
      { nome: 'ARQUIVO.PDF', tipo: 'pdf' },
      { nome: 'ARQUIVO.MP3', tipo: 'mp3' },
      { nome: 'ARQUIVO.MP4', tipo: 'mp4' },
    ],
  },
  {
    id: 2,
    cliente: 'Susana Vieira',
    clienteFoto: '',
    descricao: 'Lorem Ipsum Dolor Sit Amet, Consectetur Lorem Ipsum Dolor Sit',
    distancia: '10km',
    arquivos: [],
  },
  {
    id: 3,
    cliente: 'Susana Vieira',
    clienteFoto: '',
    descricao: 'Lorem Ipsum Dolor Sit Amet, Consectetur Lorem Ipsum Dolor Sit',
    distancia: '5km',
    arquivos: [],
  },
];

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FornecedorServicosService {

  private servicos: ServicoFornecedor[] = [...SERVICOS_MOCK];
  private trabalhos: TrabalhoFornecedor[] = [...TRABALHOS_MOCK];
  private orcamentos: OrcamentoFornecedor[] = [...ORCAMENTOS_MOCK];

  private categoriaSelecionada: string = '';

  // ── Serviços ──────────────────────────────────────────────────────────────

  getServicos(ativos: boolean = true): ServicoFornecedor[] {
    return this.servicos.filter(s => s.ativo === ativos);
  }

  getServico(id: number): ServicoFornecedor | undefined {
    return this.servicos.find(s => s.id === id);
  }

  salvarServico(servico: Partial<ServicoFornecedor>): void {
    if (servico.id) {
      const index = this.servicos.findIndex(s => s.id === servico.id);
      if (index >= 0) this.servicos[index] = { ...this.servicos[index], ...servico };
    } else {
      this.servicos.push({
        id: this.servicos.length + 1,
        categoria: this.categoriaSelecionada,
        nome: servico.nome ?? '',
        tipo: servico.tipo ?? 'Online',
        registro: servico.registro ?? '',
        valor: servico.valor ?? 0,
        descricao: servico.descricao ?? '',
        imagem: servico.imagem ?? '',
        ativo: true,
        bloqueado: false,
      });
    }
  }

  // ── Categoria selecionada ─────────────────────────────────────────────────

  setCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
  }

  getCategoria(): string {
    return this.categoriaSelecionada;
  }

  // ── Trabalhos ─────────────────────────────────────────────────────────────

  getTrabalhos(): TrabalhoFornecedor[] {
    return this.trabalhos;
  }

  getTrabalho(id: number): TrabalhoFornecedor | undefined {
    return this.trabalhos.find(t => t.id === id);
  }

  atualizarStatusTrabalho(id: number, status: StatusTrabalho): void {
    const trabalho = this.trabalhos.find(t => t.id === id);
    if (trabalho) trabalho.status = status;
  }

  // ── Orçamentos ────────────────────────────────────────────────────────────

  getOrcamentos(): OrcamentoFornecedor[] {
    return this.orcamentos;
  }

  getOrcamento(id: number): OrcamentoFornecedor | undefined {
    return this.orcamentos.find(o => o.id === id);
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}