import { Injectable } from '@angular/core';

// ─── Interfaces (prontas para integração com API) ───────────────────────────

export interface Prestador {
  id: number;
  nome: string;
  profissao: string;
  descricao: string;
  foto: string;
  imagem: string;
  gostei: number;
  naoGostei: number;
  negociacoes: number;
  atendidas: number;
  naoAtendidas: number;
  garantiasTotais: number;
  selecionado?: boolean;
}

export interface Arquivo {
  id: number;
  nome: string;
  tipo: string;
}

export interface Requisitos {
  descricao: string;
  arquivos: Arquivo[];
  tipoServico: string;
}

export type StatusOrcamento = 'nao_respondido' | 'finalizado' | 'em_andamento';
export type StatusSolicitacao = 'em_andamento' | 'em_garantia' | 'finalizada' | 'cancelada';

export interface Orcamento {
  id: number;
  prestador: Prestador;
  status: StatusOrcamento;
  previsaoInicio: string;
  previsaoFim: string;
  valor: number;
  distancia: string;
  comentario: string;
  descricao: string;
}

export interface Solicitacao {
  id: number;
  prestador: Prestador;
  status: StatusSolicitacao;
  validadeGarantia?: string;
  servicos?: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const PRESTADORES_MOCK: Prestador[] = [
  {
    id: 1,
    nome: 'Joelson Silva',
    profissao: 'Pedreiro',
    descricao: 'Lorem ipsum dolor sit amet,',
    foto: '',
    imagem: '',
    gostei: 80,
    naoGostei: 20,
    negociacoes: 100,
    atendidas: 80,
    naoAtendidas: 20,
    garantiasTotais: 20,
  },
  {
    id: 2,
    nome: 'Joelson Silva',
    profissao: 'Pedreiro',
    descricao: 'Lorem ipsum dolor sit amet,',
    foto: '',
    imagem: '',
    gostei: 80,
    naoGostei: 20,
    negociacoes: 100,
    atendidas: 80,
    naoAtendidas: 20,
    garantiasTotais: 20,
  },
  {
    id: 3,
    nome: 'Joelson Silva',
    profissao: 'Pedreiro',
    descricao: 'Lorem ipsum dolor sit amet,',
    foto: '',
    imagem: '',
    gostei: 80,
    naoGostei: 20,
    negociacoes: 100,
    atendidas: 80,
    naoAtendidas: 20,
    garantiasTotais: 20,
  },
  {
    id: 4,
    nome: 'Joelson Silva',
    profissao: 'Pedreiro',
    descricao: 'Lorem ipsum dolor sit amet,',
    foto: '',
    imagem: '',
    gostei: 80,
    naoGostei: 20,
    negociacoes: 100,
    atendidas: 80,
    naoAtendidas: 20,
    garantiasTotais: 20,
  },
  {
    id: 5,
    nome: 'Joelson Silva',
    profissao: 'Pedreiro',
    descricao: 'Lorem ipsum dolor sit amet,',
    foto: '',
    imagem: '',
    gostei: 80,
    naoGostei: 20,
    negociacoes: 100,
    atendidas: 80,
    naoAtendidas: 20,
    garantiasTotais: 20,
  },
];

const ORCAMENTOS_MOCK: Orcamento[] = [
  {
    id: 1,
    prestador: PRESTADORES_MOCK[0],
    status: 'nao_respondido',
    previsaoInicio: '00/00/0000',
    previsaoFim: '00/00/0000',
    valor: 100,
    distancia: '3 km',
    comentario: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent non porta mauris. Donec tincidunt dolor a augue ornare pretium.',
    descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent non porta mauris. Donec tincidunt dolor a augue ornare pretium. In in leo in magna vehicula pharetra. Vivamus ac euismod nisl.',
  },
  {
    id: 2,
    prestador: PRESTADORES_MOCK[1],
    status: 'finalizado',
    previsaoInicio: '00/00/0000',
    previsaoFim: '00/00/0000',
    valor: 100,
    distancia: '3 km',
    comentario: 'Lorem ipsum dolor sit amet.',
    descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 3,
    prestador: PRESTADORES_MOCK[2],
    status: 'em_andamento',
    previsaoInicio: '00/00/0000',
    previsaoFim: '00/00/0000',
    valor: 100,
    distancia: '3 km',
    comentario: 'Lorem ipsum dolor sit amet.',
    descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 4,
    prestador: PRESTADORES_MOCK[3],
    status: 'finalizado',
    previsaoInicio: '00/00/0000',
    previsaoFim: '00/00/0000',
    valor: 100,
    distancia: '3 km',
    comentario: 'Lorem ipsum dolor sit amet.',
    descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 5,
    prestador: PRESTADORES_MOCK[4],
    status: 'em_andamento',
    previsaoInicio: '00/00/0000',
    previsaoFim: '00/00/0000',
    valor: 100,
    distancia: '3 km',
    comentario: 'Lorem ipsum dolor sit amet.',
    descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
];

const SOLICITACOES_MOCK: Solicitacao[] = [
  { id: 1, prestador: PRESTADORES_MOCK[0], status: 'em_andamento' },
  { id: 2, prestador: PRESTADORES_MOCK[1], status: 'em_garantia', validadeGarantia: '00/00/00', servicos: 100 },
  { id: 3, prestador: PRESTADORES_MOCK[2], status: 'em_andamento' },
  { id: 4, prestador: PRESTADORES_MOCK[3], status: 'em_andamento' },
  { id: 5, prestador: PRESTADORES_MOCK[4], status: 'em_andamento' },
];

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ServicosService {

  private prestadoresSelecionados: Prestador[] = [];
  private requisitos: Requisitos = { descricao: '', arquivos: [], tipoServico: 'Urgente' };

  // ── Prestadores ───────────────────────────────────────────────────────────

  getPrestadores(categoria?: string): Prestador[] {
    // Futuramente: return this.http.get<Prestador[]>(`/api/servicos/prestadores?categoria=${categoria}`)
    return PRESTADORES_MOCK.map(p => ({ ...p, selecionado: false }));
  }

  getPrestador(id: number): Prestador | undefined {
    // Futuramente: return this.http.get<Prestador>(`/api/servicos/prestadores/${id}`)
    return PRESTADORES_MOCK.find(p => p.id === id);
  }

  // ── Seleção ───────────────────────────────────────────────────────────────

  setSelecionados(prestadores: Prestador[]) {
    this.prestadoresSelecionados = prestadores;
  }

  getSelecionados(): Prestador[] {
    return this.prestadoresSelecionados;
  }

  // ── Requisitos ────────────────────────────────────────────────────────────

  setRequisitos(requisitos: Requisitos) {
    this.requisitos = requisitos;
  }

  getRequisitos(): Requisitos {
    return this.requisitos;
  }

  // ── Orçamentos ────────────────────────────────────────────────────────────

  getOrcamentos(): Orcamento[] {
    // Futuramente: return this.http.get<Orcamento[]>('/api/servicos/orcamentos')
    return ORCAMENTOS_MOCK;
  }

  getOrcamento(id: number): Orcamento | undefined {
    // Futuramente: return this.http.get<Orcamento>(`/api/servicos/orcamentos/${id}`)
    return ORCAMENTOS_MOCK.find(o => o.id === id);
  }

  // ── Solicitações ──────────────────────────────────────────────────────────

  getSolicitacoes(): Solicitacao[] {
    // Futuramente: return this.http.get<Solicitacao[]>('/api/servicos/solicitacoes')
    return SOLICITACOES_MOCK;
  }
}