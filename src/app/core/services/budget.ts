import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api';
import { Page } from '../models/pagination';
import {
  BudgetDto,
  BudgetListItemDto,
  BudgetQuery,
  RequestBudgetInformationDto,
  RespondBudgetExtraDto,
  UpdateBudgetDto,
} from '../models/budget';
import { BudgetStatus, BudgetTimeUnit } from '../models/enums';
import { Prestador } from './service-catalog';

/** View-model do orçamento no lado do fornecedor (recebido). */
export interface OrcamentoFornecedor {
  id: number;
  cliente: string;
  clienteFoto: string;
  descricao: string;
  distancia: string;
  arquivos: { nome: string; tipo: string }[];
}

/** Status do mock (3 estados) usado pelos templates de orçamento. */
export type StatusOrcamento = 'nao_respondido' | 'finalizado' | 'em_andamento';

/** View-model de orçamento (adapta `/budgets` às telas). */
export interface Orcamento {
  id: number;
  prestador: Prestador;
  status: StatusOrcamento;
  statusApi: BudgetStatus;
  previsaoInicio: string;
  previsaoFim: string;
  valor: number;
  distancia: string;
  comentario: string;
  descricao: string;
  temAcrescimoPendente: boolean;
}

interface ResponseFindAllBudgetDto {
  budgets: BudgetListItemDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

const UNIDADE: Record<BudgetTimeUnit, string> = {
  Hour: 'hora(s)',
  Day: 'dia(s)',
  Week: 'semana(s)',
  Month: 'mês(es)',
};

/** Orçamentos (`/budgets`): listagem, detalhe, aprovação e resposta a acréscimo. */
@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly api = inject(ApiService);

  /** Lista orçamentos (view-model) — `GET /v1/budgets`. */
  meus(query: BudgetQuery = {}): Observable<Orcamento[]> {
    return this.api
      .get<ResponseFindAllBudgetDto>('/budgets', {
        scope: query.scope,
        status: query.status,
        serviceId: query.serviceId,
        search: query.search,
        take: query.take,
        skip: query.skip,
      })
      .pipe(map((r) => (r.budgets ?? []).map((b) => this.mapListItem(b))));
  }

  /** Página crua (quando precisar dos metadados). */
  pagina(query: BudgetQuery = {}): Observable<Page<BudgetListItemDto>> {
    return this.api
      .get<ResponseFindAllBudgetDto>('/budgets', {
        scope: query.scope,
        status: query.status,
        serviceId: query.serviceId,
        search: query.search,
        take: query.take,
        skip: query.skip,
      })
      .pipe(
        map((r) => ({
          items: r.budgets ?? [],
          currentPage: r.currentPage,
          totalPages: r.totalPages,
          totalRecords: r.totalRecords,
        })),
      );
  }

  /** Detalhe de um orçamento — `GET /v1/budgets/{id}`. */
  orcamento(id: number): Observable<Orcamento> {
    return this.api.get<BudgetDto>(`/budgets/${id}`).pipe(map((b) => this.mapDetail(b)));
  }

  /** Cliente aprova um orçamento respondido (gera o trabalho) — `PATCH /v1/budgets/{id}/approve`. */
  aprovar(id: number): Observable<unknown> {
    return this.api.patch(`/budgets/${id}/approve`, {});
  }

  /** Cliente responde a um acréscimo — `PATCH /v1/budgets/{id}/respond-extra`. */
  responderAcrescimo(id: number, dto: RespondBudgetExtraDto): Observable<BudgetDto> {
    return this.api.patch<BudgetDto>(`/budgets/${id}/respond-extra`, dto);
  }

  // ── Fornecedor (orçamentos recebidos) ─────────────────────────────────────

  /** Orçamentos recebidos pelo fornecedor — `GET /v1/budgets?scope=Received`. */
  recebidos(query: BudgetQuery = {}): Observable<OrcamentoFornecedor[]> {
    return this.api
      .get<ResponseFindAllBudgetDto>('/budgets', {
        scope: 'Received',
        status: query.status,
        serviceId: query.serviceId,
        search: query.search,
        take: query.take,
        skip: query.skip,
      })
      .pipe(map((r) => (r.budgets ?? []).map((b) => this.mapFornecedorItem(b))));
  }

  /** Detalhe do orçamento (lado fornecedor) — `GET /v1/budgets/{id}`. */
  orcamentoFornecedor(id: number): Observable<OrcamentoFornecedor> {
    return this.api.get<BudgetDto>(`/budgets/${id}`).pipe(map((b) => this.mapFornecedorDetail(b)));
  }

  /** Fornecedor responde ao orçamento — `PATCH /v1/budgets/{id}`. */
  responderOrcamento(id: number, dto: UpdateBudgetDto): Observable<BudgetDto> {
    return this.api.patch<BudgetDto>(`/budgets/${id}`, dto);
  }

  /** Fornecedor pede mais informações — `PATCH /v1/budgets/{id}/request-more-information`. */
  pedirMaisInfo(id: number, dto: RequestBudgetInformationDto): Observable<BudgetDto> {
    return this.api.patch<BudgetDto>(`/budgets/${id}/request-more-information`, dto);
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private mapFornecedorItem(b: BudgetListItemDto): OrcamentoFornecedor {
    return {
      id: b.id,
      cliente: b.requester?.name ?? '—',
      clienteFoto: b.requester?.fileUrl ?? '',
      descricao: b.description ?? '',
      distancia: '',
      arquivos: [],
    };
  }

  private mapFornecedorDetail(b: BudgetDto): OrcamentoFornecedor {
    return {
      id: b.id,
      cliente: b.requester?.name ?? '—',
      clienteFoto: b.requester?.fileUrl ?? '',
      descricao: b.description ?? '',
      distancia: '',
      arquivos: (b.files ?? []).map((f) => ({ nome: f.fileName, tipo: f.type })),
    };
  }

  // ── Mapeamento ─────────────────────────────────────────────────────────────

  private statusVm(status: BudgetStatus): StatusOrcamento {
    switch (status) {
      case 'Pending':
        return 'nao_respondido';
      case 'Cancelled':
        return 'finalizado';
      default: // Responded, WaitingInformation
        return 'em_andamento';
    }
  }

  private prazo(qtd?: number, unidade?: BudgetTimeUnit): string {
    if (!qtd || !unidade) return '';
    return `${qtd} ${UNIDADE[unidade]}`;
  }

  private prestadorDe(provider: { id: number; name: string; fileUrl?: string }, profissao: string, descricao: string): Prestador {
    return {
      id: provider.id,
      nome: provider.name,
      profissao,
      descricao,
      foto: provider.fileUrl ?? '',
      gostei: 0,
      naoGostei: 0,
      negociacoes: 0,
    };
  }

  private mapListItem(b: BudgetListItemDto): Orcamento {
    return {
      id: b.id,
      prestador: this.prestadorDe(b.provider, b.service?.name ?? '', b.description ?? ''),
      status: this.statusVm(b.status),
      statusApi: b.status,
      previsaoInicio: '',
      previsaoFim: this.prazo(b.responseTimeQuantity, b.responseTimeUnit),
      valor: Number(b.responseValue ?? 0),
      distancia: '',
      comentario: '',
      descricao: b.description ?? '',
      temAcrescimoPendente: b.extraRequestStatus === 'Pending',
    };
  }

  private mapDetail(b: BudgetDto): Orcamento {
    return {
      id: b.id,
      prestador: this.prestadorDe(b.provider, b.service?.name ?? '', b.description ?? ''),
      status: this.statusVm(b.status),
      statusApi: b.status,
      previsaoInicio: b.createdAt ? new Date(b.createdAt).toLocaleDateString('pt-BR') : '',
      previsaoFim: this.prazo(b.responseTimeQuantity, b.responseTimeUnit),
      valor: Number(b.responseValue ?? 0),
      distancia: '',
      comentario: b.responseDescription ?? '',
      descricao: b.description ?? '',
      temAcrescimoPendente: b.extraRequestStatus === 'Pending',
    };
  }
}
