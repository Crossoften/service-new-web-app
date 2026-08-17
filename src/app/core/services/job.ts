import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api';
import { Page } from '../models/pagination';
import { CreateJobDto, JobDto, JobQuery, JobType, UpdateJobDto } from '../models/job';
import {
  ApplyJobDto,
  JobApplicationDto,
  JobApplicationQuery,
  JobApplicationStatus,
  RespondJobApplicationDto,
} from '../models/job-application';

interface ResponseFindAllJobDto {
  jobs: JobDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

interface ResponseFindAllJobApplicationDto {
  applications: JobApplicationDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

interface CreateJobResponseDto {
  message: string;
  job: JobDto;
}

interface CreateJobApplicationResponseDto {
  message: string;
  application: JobApplicationDto;
}

/** Empregos: vagas (`/jobs`) e candidaturas (`/jobs/applications`). */
@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly api = inject(ApiService);

  // ── Vagas ──────────────────────────────────────────────────────────────

  vagas(query: JobQuery = {}): Observable<Page<JobDto>> {
    return this.api
      .get<ResponseFindAllJobDto>('/jobs', {
        type: query.type,
        isActive: query.isActive,
        scope: query.scope,
        take: query.take,
        skip: query.skip,
      })
      .pipe(
        map((r) => ({
          items: r.jobs ?? [],
          currentPage: r.currentPage,
          totalPages: r.totalPages,
          totalRecords: r.totalRecords,
        })),
      );
  }

  vaga(id: number): Observable<JobDto> {
    return this.api.get<JobDto>(`/jobs/${id}`);
  }

  criarVaga(dto: CreateJobDto): Observable<JobDto> {
    return this.api.post<CreateJobResponseDto>('/jobs', dto).pipe(map((r) => r.job));
  }

  atualizarVaga(id: number, dto: UpdateJobDto): Observable<JobDto> {
    return this.api.patch<JobDto>(`/jobs/${id}`, dto);
  }

  // ── Candidaturas ─────────────────────────────────────────────────────────

  candidatar(id: number, dto: ApplyJobDto): Observable<JobApplicationDto> {
    return this.api
      .post<CreateJobApplicationResponseDto>(`/jobs/${id}/apply`, dto)
      .pipe(map((r) => r.application));
  }

  minhasCandidaturas(query: JobApplicationQuery = {}): Observable<Page<JobApplicationDto>> {
    return this.paginaCandidaturas('/jobs/applications/me', query);
  }

  candidaturasDaVaga(id: number, query: JobApplicationQuery = {}): Observable<Page<JobApplicationDto>> {
    return this.paginaCandidaturas(`/jobs/${id}/applications`, query);
  }

  candidatura(id: number): Observable<JobApplicationDto> {
    return this.api.get<JobApplicationDto>(`/jobs/applications/${id}`);
  }

  responderCandidatura(id: number, dto: RespondJobApplicationDto): Observable<JobApplicationDto> {
    return this.api.patch<JobApplicationDto>(`/jobs/applications/${id}/respond`, dto);
  }

  private paginaCandidaturas(
    path: string,
    query: JobApplicationQuery,
  ): Observable<Page<JobApplicationDto>> {
    return this.api
      .get<ResponseFindAllJobApplicationDto>(path, {
        status: query.status,
        take: query.take,
        skip: query.skip,
      })
      .pipe(
        map((r) => ({
          items: r.applications ?? [],
          currentPage: r.currentPage,
          totalPages: r.totalPages,
          totalRecords: r.totalRecords,
        })),
      );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  formatarPreco(valor?: number | string): string {
    const n = typeof valor === 'string' ? Number(valor) : (valor ?? 0);
    return (Number.isFinite(n) ? n : 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  tipoLabel(tipo: JobType): string {
    switch (tipo) {
      case 'CLT':
        return 'CLT';
      case 'PJ':
        return 'PJ';
      case 'Freelance':
        return 'Freelance';
      case 'Temporary':
        return 'Temporário';
      default:
        return tipo;
    }
  }

  statusCandidaturaLabel(status: JobApplicationStatus): string {
    switch (status) {
      case 'Applied':
        return 'Candidatado';
      case 'Accepted':
        return 'Aceito';
      case 'Rejected':
        return 'Recusado';
      default:
        return status;
    }
  }
}
