import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api';
import {
  CreateServiceDto,
  ServiceCategoryDto,
  ServiceDto,
  ServiceListItemDto,
  ServiceQuery,
  UpdateServiceDto,
} from '../models/service';
import { BudgetDto, CreateBudgetDto } from '../models/budget';
import { ServiceType } from '../models/enums';
import { ApiMessage } from '../models/common';

/** View-model do serviço do fornecedor (telas de gestão). */
export interface ServicoFornecedor {
  id: number;
  categoria: string;
  categoryId: number;
  nome: string;
  tipo: string; // rótulo em pt (Online/Presencial/Em domicílio)
  tipoApi: ServiceType;
  registro: string;
  valor: number;
  descricao: string;
  imagem: string;
  imageKey?: string;
  ativo: boolean;
  bloqueado: boolean;
  avaliacoesPositivas: number;
  avaliacoesNegativas: number;
  trabalhosConcluidos: number;
}

/** Rótulos pt ↔ ServiceType da API. */
const TIPO_LABEL: Record<ServiceType, string> = {
  Online: 'Online',
  Presential: 'Presencial',
  Home: 'Em domicílio',
};

/** View-model do prestador (adapta os DTOs de `/services` às telas de serviços). */
export interface Prestador {
  id: number; // = service.id
  nome: string;
  profissao: string;
  descricao: string;
  foto: string;
  imagem?: string;
  gostei: number;
  naoGostei: number;
  negociacoes: number;
  atendidas?: number;
  naoAtendidas?: number;
  garantiasTotais?: number;
  preco?: number;
  selecionado?: boolean;
}

interface ResponseFindAllServiceDto {
  services: ServiceListItemDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

interface CreateBudgetResponseDto {
  message: string;
  budget: BudgetDto;
}

/** Catálogo de serviços (`/services`) + solicitação de orçamento (`POST /budgets`). */
@Injectable({ providedIn: 'root' })
export class ServiceCatalogService {
  private readonly api = inject(ApiService);

  categorias(): Observable<ServiceCategoryDto[]> {
    return this.api.get<ServiceCategoryDto[]>('/services/categories');
  }

  /** Lista serviços ativos como prestadores (view-model). */
  prestadores(query: ServiceQuery = {}): Observable<Prestador[]> {
    return this.api
      .get<ResponseFindAllServiceDto>('/services', {
        search: query.search,
        name: query.name,
        categoryId: query.categoryId,
        type: query.type,
        userId: query.userId,
        isActive: query.isActive,
        take: query.take,
        skip: query.skip,
      })
      .pipe(map((r) => (r.services ?? []).map((s) => this.mapListItem(s))));
  }

  /** Detalhe de um serviço/prestador — `GET /v1/services/{id}`. */
  prestador(id: number): Observable<Prestador> {
    return this.api.get<ServiceDto>(`/services/${id}`).pipe(map((s) => this.mapDetail(s)));
  }

  /** Solicita orçamento de um serviço — `POST /v1/budgets`. */
  solicitarOrcamento(dto: CreateBudgetDto): Observable<BudgetDto> {
    return this.api.post<CreateBudgetResponseDto>('/budgets', dto).pipe(map((r) => r.budget));
  }

  // ── Fornecedor (meus serviços) ─────────────────────────────────────────────

  /** Serviços do fornecedor autenticado — `GET /v1/services/my-services`. */
  meusServicos(isActive?: boolean): Observable<ServicoFornecedor[]> {
    return this.api
      .get<ResponseFindAllServiceDto>('/services/my-services', { isActive })
      .pipe(map((r) => (r.services ?? []).map((s) => this.mapServico(s))));
  }

  /** Detalhe do serviço (para edição) — `GET /v1/services/{id}`. */
  meuServico(id: number): Observable<ServicoFornecedor> {
    return this.api.get<ServiceDto>(`/services/${id}`).pipe(map((s) => this.mapServico(s)));
  }

  criarServico(dto: CreateServiceDto): Observable<unknown> {
    return this.api.post('/services', dto);
  }

  atualizarServico(id: number, dto: UpdateServiceDto): Observable<unknown> {
    return this.api.patch(`/services/${id}`, dto);
  }

  removerServico(id: number): Observable<ApiMessage> {
    return this.api.delete<ApiMessage>(`/services/${id}`);
  }

  tipoApi(label: string): ServiceType {
    if (label === 'Presencial') return 'Presential';
    if (label === 'Em domicílio') return 'Home';
    return 'Online';
  }

  private mapServico(s: ServiceListItemDto | ServiceDto): ServicoFornecedor {
    return {
      id: s.id,
      categoria: s.category?.name ?? '',
      categoryId: (s as ServiceDto).categoryId ?? s.category?.id ?? 0,
      nome: s.name,
      tipo: TIPO_LABEL[s.type] ?? 'Online',
      tipoApi: s.type,
      registro: (s as ServiceDto).registrationCode ?? '',
      valor: Number(s.price),
      descricao: s.description ?? '',
      imagem: s.imageUrl ?? '',
      imageKey: (s as ServiceDto).imageKey,
      ativo: s.isActive,
      bloqueado: false,
      avaliacoesPositivas: s.positiveReviews ?? 0,
      avaliacoesNegativas: s.negativeReviews ?? 0,
      trabalhosConcluidos: s.completedWorks ?? 0,
    };
  }

  // ── Mapeamento DTO → view-model ────────────────────────────────────────────

  private mapListItem(s: ServiceListItemDto): Prestador {
    return {
      id: s.id,
      nome: s.user?.name ?? '—',
      profissao: s.name,
      descricao: s.description ?? '',
      foto: '',
      gostei: s.positiveReviews,
      naoGostei: s.negativeReviews,
      negociacoes: s.completedWorks,
      preco: Number(s.price),
      selecionado: false,
    };
  }

  private mapDetail(s: ServiceDto): Prestador {
    return {
      ...this.mapListItem(s),
      imagem: s.imageUrl,
      atendidas: s.completedWorks,
      naoAtendidas: 0,
      garantiasTotais: 0,
    };
  }
}
