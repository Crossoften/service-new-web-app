/** Tipo de contratação da vaga. */
export type JobType = 'CLT' | 'PJ' | 'Freelance' | 'Temporary';

export type JobScope = 'Mine' | 'All';

export interface JobEmployerDto {
  id: number;
  name: string;
  fileUrl?: string;
}

/** Vaga — `GET /v1/jobs/{id}` (ResponseJobDto). `value` é string. */
export interface JobDto {
  id: number;
  title: string;
  type: JobType;
  value?: string;
  requirements?: string;
  description?: string;
  isActive: boolean;
  employer: JobEmployerDto;
  applicationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** Corpo de `POST /v1/jobs` (CreateJobDto). */
export interface CreateJobDto {
  title: string;
  type: JobType;
  value?: number;
  requirements?: string;
  description?: string;
}

/** Corpo de `PATCH /v1/jobs/{id}` (UpdateJobDto). */
export interface UpdateJobDto {
  title?: string;
  type?: JobType;
  value?: number;
  requirements?: string;
  description?: string;
  isActive?: boolean;
}

export interface JobQuery {
  type?: JobType;
  isActive?: boolean;
  scope?: JobScope;
  take?: number;
  skip?: number;
}
