import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { VagaCandidaturasComponent } from './vaga-candidaturas';

describe('VagaCandidaturasComponent', () => {
  let component: VagaCandidaturasComponent;
  let fixture: ComponentFixture<VagaCandidaturasComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VagaCandidaturasComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VagaCandidaturasComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega candidaturas e aceita uma', () => {
    httpMock.expectOne((r) => r.url.endsWith('/jobs/1/applications')).flush({
      applications: [aplicacao('Applied')],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.candidaturas.length).toBe(1);
    component.aceitar(component.candidaturas[0]);
    const req = httpMock.expectOne((r) => r.url.endsWith('/jobs/applications/5/respond'));
    expect(req.request.body.status).toBe('Accepted');
    req.flush(aplicacao('Accepted'));
    expect(component.candidaturas[0].status).toBe('Accepted');
  });

  function aplicacao(status: string) {
    return {
      id: 5, status, chatRoomId: 9, job: { id: 1, title: 'Dev' },
      applicant: { id: 2, name: 'Ana' }, createdAt: '', updatedAt: '',
    };
  }
});
