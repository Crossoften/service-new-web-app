import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api';
import { Page } from '../models/pagination';
import {
  WorkDto,
  WorkListItemDto,
  WorkQuery,
  CreateWorkDto,
  FinishWorkDto,
  PayWorkDto,
  RequestWorkWarrantyDto,
  RespondWorkWarrantyDto,
  RequestWorkExtraDto,
  RespondWorkExtraDto,
  CancelWorkDto,
} from '../models/work';
import { WorkStatus } from '../models/enums';

/** Status do mock (cliente) — 4 estados usados pelas telas de solicitação. */
export type StatusSolicitacao = 'em_andamento' | 'em_garantia' | 'finalizada' | 'cancelada';
/** Status do mock (fornecedor) — 4 estados usados pelas telas de trabalho. */
export type StatusTrabalho = 'em_andamento' | 'em_garantia' | 'finalizado' | 'cancelado';

/** Resumo do prestador exibido nos cards de solicitação. */
export interface PrestadorResumo {
  id: number;
  nome: string;
  profissao: string;
  descricao: string;
  foto: string;
  gostei: number;
  naoGostei: number;
  negociacoes: number;
}

export interface ArquivoTrabalho {
  id: number;
  nome: string;
  tipo: string;
  url: string;
}

/** View-model do trabalho no lado do cliente (adapta `/works/my-requests`). */
export interface Solicitacao {
  id: number;
  prestador: PrestadorResumo;
  status: StatusSolicitacao;
  statusApi: WorkStatus;
  validadeGarantia?: string;
  servicos?: number;
  realizadoEm: string;
  valorServico: number;
  total: number;
  arquivos: ArquivoTrabalho[];
  chatId?: number;
  arrivalConfirmed: boolean;
  sobGarantia: boolean;
  pago: boolean;
  extraPendente: boolean;
  extraValor: number;
  extraDescricao: string;
}

/** View-model do trabalho no lado do fornecedor (adapta `/works?scope=Received`). */
export interface TrabalhoFornecedor {
  id: number;
  cliente: string;
  clienteFoto: string;
  descricao: string;
  status: StatusTrabalho;
  statusApi: WorkStatus;
  validadeGarantia?: string;
  realizado: string;
  valorServico: number;
  total: number;
  arquivosCliente: { nome: string; tipo: string }[];
  chatId?: number;
  extraPendente: boolean;
}

interface ResponseFindAllWorkDto {
  works: WorkListItemDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

/** Trabalhos (`/works`): fluxo pós-orçamento aprovado (cliente e fornecedor). */
@Injectable({ providedIn: 'root' })
export class WorkService {
  private readonly api = inject(ApiService);

  // ── Cliente (minhas solicitações) ──────────────────────────────────────────

  /** Trabalhos solicitados pelo cliente — `GET /v1/works/my-requests`. */
  minhasSolicitacoes(query: WorkQuery = {}): Observable<Solicitacao[]> {
    return this.api
      .get<ResponseFindAllWorkDto>('/works/my-requests', this.params(query))
      .pipe(map((r) => (r.works ?? []).map((w) => this.mapSolicitacaoItem(w))));
  }

  /** Detalhe de um trabalho (lado cliente) — `GET /v1/works/{id}`. */
  solicitacao(id: number): Observable<Solicitacao> {
    return this.api.get<WorkDto>(`/works/${id}`).pipe(map((w) => this.mapSolicitacaoDetail(w)));
  }

  /** Cliente confirma a chegada do fornecedor — `PATCH /v1/works/{id}/confirm-arrival`. */
  confirmarChegada(id: number): Observable<WorkDto> {
    return this.api.patch<WorkDto>(`/works/${id}/confirm-arrival`, {});
  }

  /** Cliente paga o trabalho concluído — `POST /v1/works/{id}/pay`. */
  pagar(id: number, dto: PayWorkDto): Observable<WorkDto> {
    return this.api.post<WorkDto>(`/works/${id}/pay`, dto);
  }

  /** Cliente solicita garantia — `POST /v1/works/{id}/request-warranty`. */
  solicitarGarantia(id: number, dto: RequestWorkWarrantyDto): Observable<WorkDto> {
    return this.api.post<WorkDto>(`/works/${id}/request-warranty`, dto);
  }

  /** Cliente responde ao acréscimo solicitado — `PATCH /v1/works/{id}/respond-extra`. */
  responderAcrescimo(id: number, dto: RespondWorkExtraDto): Observable<WorkDto> {
    return this.api.patch<WorkDto>(`/works/${id}/respond-extra`, dto);
  }

  // ── Fornecedor (trabalhos recebidos) ───────────────────────────────────────

  /** Trabalhos recebidos pelo fornecedor — `GET /v1/works?scope=Received`. */
  trabalhos(query: WorkQuery = {}): Observable<TrabalhoFornecedor[]> {
    return this.api
      .get<ResponseFindAllWorkDto>('/works', this.params({ ...query, scope: 'Received' }))
      .pipe(map((r) => (r.works ?? []).map((w) => this.mapTrabalhoItem(w))));
  }

  /** Página crua de trabalhos (quando precisar dos metadados). */
  paginaTrabalhos(query: WorkQuery = {}): Observable<Page<WorkListItemDto>> {
    return this.api.get<ResponseFindAllWorkDto>('/works', this.params(query)).pipe(
      map((r) => ({
        items: r.works ?? [],
        currentPage: r.currentPage,
        totalPages: r.totalPages,
        totalRecords: r.totalRecords,
      })),
    );
  }

  /** Detalhe de um trabalho (lado fornecedor) — `GET /v1/works/{id}`. */
  trabalho(id: number): Observable<TrabalhoFornecedor> {
    return this.api.get<WorkDto>(`/works/${id}`).pipe(map((w) => this.mapTrabalhoDetail(w)));
  }

  /** Fornecedor cria o trabalho a partir do orçamento aprovado — `POST /v1/works`. */
  criar(dto: CreateWorkDto): Observable<WorkDto> {
    return this.api.post<WorkDto>('/works', dto);
  }

  /** Fornecedor inicia o serviço — `PATCH /v1/works/{id}/start`. */
  iniciar(id: number): Observable<WorkDto> {
    return this.api.patch<WorkDto>(`/works/${id}/start`, {});
  }

  /** Fornecedor finaliza o serviço — `PATCH /v1/works/{id}/finish`. */
  finalizar(id: number, dto: FinishWorkDto): Observable<WorkDto> {
    return this.api.patch<WorkDto>(`/works/${id}/finish`, dto);
  }

  /** Fornecedor solicita acréscimo — `PATCH /v1/works/{id}/request-extra`. */
  solicitarAcrescimo(id: number, dto: RequestWorkExtraDto): Observable<WorkDto> {
    return this.api.patch<WorkDto>(`/works/${id}/request-extra`, dto);
  }

  /** Fornecedor responde à solicitação de garantia — `PATCH /v1/works/{id}/respond-warranty`. */
  responderGarantia(id: number, dto: RespondWorkWarrantyDto): Observable<WorkDto> {
    return this.api.patch<WorkDto>(`/works/${id}/respond-warranty`, dto);
  }

  // ── Comum ──────────────────────────────────────────────────────────────────

  /** Cancela um trabalho — `PATCH /v1/works/{id}/cancel`. */
  cancelar(id: number, dto: CancelWorkDto): Observable<WorkDto> {
    return this.api.patch<WorkDto>(`/works/${id}/cancel`, dto);
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ── Mapeamento DTO → view-model ────────────────────────────────────────────

  private params(query: WorkQuery) {
    return {
      scope: query.scope,
      status: query.status,
      serviceId: query.serviceId,
      search: query.search,
      take: query.take,
      skip: query.skip,
    };
  }

  private statusSolicitacao(status: WorkStatus, sobGarantia: boolean): StatusSolicitacao {
    switch (status) {
      case 'Cancelled':
        return 'cancelada';
      case 'Finished':
        return sobGarantia ? 'em_garantia' : 'finalizada';
      default: // Pending, InProgress
        return 'em_andamento';
    }
  }

  private statusTrabalho(status: WorkStatus, sobGarantia: boolean): StatusTrabalho {
    switch (status) {
      case 'Cancelled':
        return 'cancelado';
      case 'Finished':
        return sobGarantia ? 'em_garantia' : 'finalizado';
      default:
        return 'em_andamento';
    }
  }

  private data(iso?: string): string {
    return iso ? new Date(iso).toLocaleDateString('pt-BR') : '';
  }

  private mapSolicitacaoItem(w: WorkListItemDto): Solicitacao {
    return {
      id: w.id,
      prestador: {
        id: w.provider?.id ?? 0,
        nome: w.provider?.name ?? '—',
        profissao: w.service?.name ?? '',
        descricao: '',
        foto: w.provider?.fileUrl ?? '',
        gostei: 0,
        naoGostei: 0,
        negociacoes: 0,
      },
      status: this.statusSolicitacao(w.status, w.isUnderWarranty),
      statusApi: w.status,
      validadeGarantia: this.data(w.warrantyExpiresAt),
      realizadoEm: this.data(w.serviceDate ?? w.createdAt),
      valorServico: Number(w.serviceValue ?? 0),
      total: Number(w.totalValue ?? w.serviceValue ?? 0),
      arquivos: [],
      chatId: w.chat?.id,
      arrivalConfirmed: !!w.arrivalConfirmedAt,
      sobGarantia: w.isUnderWarranty,
      pago: !!w.payment,
      extraPendente: w.extraRequestStatus === 'Pending',
      extraValor: 0,
      extraDescricao: '',
    };
  }

  private mapSolicitacaoDetail(w: WorkDto): Solicitacao {
    return {
      id: w.id,
      prestador: {
        id: w.provider?.id ?? 0,
        nome: w.provider?.name ?? '—',
        profissao: w.service?.name ?? '',
        descricao: w.details ?? w.completionDescription ?? '',
        foto: w.provider?.fileUrl ?? '',
        gostei: 0,
        naoGostei: 0,
        negociacoes: 0,
      },
      status: this.statusSolicitacao(w.status, w.isUnderWarranty),
      statusApi: w.status,
      validadeGarantia: this.data(w.warrantyExpiresAt),
      realizadoEm: this.data(w.serviceDate ?? w.createdAt),
      valorServico: Number(w.serviceValue ?? 0),
      total: Number(w.totalValue ?? w.serviceValue ?? 0),
      arquivos: (w.files ?? []).map((f) => ({
        id: f.id,
        nome: f.fileName,
        tipo: f.type,
        url: f.fileUrl,
      })),
      chatId: w.chat?.id,
      arrivalConfirmed: !!w.arrivalConfirmedAt,
      sobGarantia: w.isUnderWarranty,
      pago: !!w.payment,
      extraPendente: w.extraRequestStatus === 'Pending',
      extraValor: Number(w.extraRequestValue ?? 0),
      extraDescricao: w.extraRequestDescription ?? '',
    };
  }

  private mapTrabalhoItem(w: WorkListItemDto): TrabalhoFornecedor {
    return {
      id: w.id,
      cliente: w.requester?.name ?? '—',
      clienteFoto: w.requester?.fileUrl ?? '',
      descricao: w.service?.name ?? '',
      status: this.statusTrabalho(w.status, w.isUnderWarranty),
      statusApi: w.status,
      validadeGarantia: this.data(w.warrantyExpiresAt),
      realizado: this.data(w.serviceDate ?? w.createdAt),
      valorServico: Number(w.serviceValue ?? 0),
      total: Number(w.totalValue ?? w.serviceValue ?? 0),
      arquivosCliente: [],
      chatId: w.chat?.id,
      extraPendente: w.extraRequestStatus === 'Pending',
    };
  }

  private mapTrabalhoDetail(w: WorkDto): TrabalhoFornecedor {
    return {
      id: w.id,
      cliente: w.requester?.name ?? '—',
      clienteFoto: w.requester?.fileUrl ?? '',
      descricao: w.details ?? w.service?.name ?? '',
      status: this.statusTrabalho(w.status, w.isUnderWarranty),
      statusApi: w.status,
      validadeGarantia: this.data(w.warrantyExpiresAt),
      realizado: this.data(w.serviceDate ?? w.createdAt),
      valorServico: Number(w.serviceValue ?? 0),
      total: Number(w.totalValue ?? w.serviceValue ?? 0),
      arquivosCliente: (w.files ?? [])
        .filter((f) => f.type === 'Requester')
        .map((f) => ({ nome: f.fileName, tipo: f.type })),
      chatId: w.chat?.id,
      extraPendente: w.extraRequestStatus === 'Pending',
    };
  }
}
