import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ListagemEmpregosComponent } from './listagem-empregos';

describe('ListagemEmpregosComponent', () => {
  let component: ListagemEmpregosComponent;
  let fixture: ComponentFixture<ListagemEmpregosComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemEmpregosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemEmpregosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista vagas ativas (scope=All)', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/jobs'));
    expect(req.request.params.get('scope')).toBe('All');
    req.flush({
      jobs: [{ id: 1, title: 'Dev Back-end', type: 'PJ', isActive: true, employer: { id: 9, name: 'Empresa X' }, createdAt: '', updatedAt: '' }],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.vagas.length).toBe(1);
  });
});
