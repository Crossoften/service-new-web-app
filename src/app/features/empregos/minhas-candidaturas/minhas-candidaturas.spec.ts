import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { MinhasCandidaturasComponent } from './minhas-candidaturas';

describe('MinhasCandidaturasComponent', () => {
  let component: MinhasCandidaturasComponent;
  let fixture: ComponentFixture<MinhasCandidaturasComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhasCandidaturasComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinhasCandidaturasComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista minhas candidaturas', () => {
    httpMock.expectOne((r) => r.url.endsWith('/jobs/applications/me')).flush({
      applications: [
        { id: 1, status: 'Applied', chatRoomId: 9, job: { id: 1, title: 'Dev' }, applicant: { id: 2, name: 'Ana' }, createdAt: '', updatedAt: '' },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.candidaturas.length).toBe(1);
  });
});
