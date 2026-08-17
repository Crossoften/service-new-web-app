import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { DetalheVagaComponent } from './detalhe-vaga';
import { SessionService } from '../../../core/services/session';

describe('DetalheVagaComponent', () => {
  let component: DetalheVagaComponent;
  let fixture: ComponentFixture<DetalheVagaComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalheVagaComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    // Candidato (id 2), vaga do empregador 9.
    TestBed.inject(SessionService).setSession({ token: 't', userId: 2, profileType: 'Client', role: null });

    fixture = TestBed.createComponent(DetalheVagaComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/jobs/1')).flush({
      id: 1, title: 'Dev Back-end', type: 'PJ', isActive: true,
      employer: { id: 9, name: 'Empresa X' }, createdAt: '', updatedAt: '',
    });
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.inject(SessionService).clear();
  });

  it('candidato pode se candidatar (POST apply)', () => {
    expect(component.souEmpregador).toBe(false);
    component.mensagem = 'Tenho interesse';
    component.candidatar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/jobs/1/apply'));
    expect(req.request.body.message).toBe('Tenho interesse');
    req.flush({ message: 'ok', application: { id: 5 } });
    expect(component.sucesso).toContain('enviada');
  });
});
