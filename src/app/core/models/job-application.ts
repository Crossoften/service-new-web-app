/** Status da candidatura (`/jobs/applications`). */
export type JobApplicationStatus = 'Applied' | 'Accepted' | 'Rejected';

export interface JobApplicationJobDto {
  id: number;
  title: string;
}

export interface JobApplicationUserDto {
  id: number;
  name: string;
  fileUrl?: string;
}

/** Candidatura — `GET /v1/jobs/applications/{id}` (ResponseJobApplicationDto). */
export interface JobApplicationDto {
  id: number;
  status: JobApplicationStatus;
  message?: string;
  chatRoomId: number;
  job: JobApplicationJobDto;
  applicant: JobApplicationUserDto;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Corpo de `POST /v1/jobs/{id}/apply` (ApplyJobDto). */
export interface ApplyJobDto {
  message?: string;
}

/** Corpo de `PATCH /v1/jobs/applications/{id}/respond` (empregador). */
export interface RespondJobApplicationDto {
  status: 'Accepted' | 'Rejected';
}

export interface JobApplicationQuery {
  status?: JobApplicationStatus;
  take?: number;
  skip?: number;
}
