import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { RequisitosServicoComponent } from './requisitos-servico';

describe('RequisitosServicoComponent', () => {
  let component: RequisitosServicoComponent;
  let fixture: ComponentFixture<RequisitosServicoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequisitosServicoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ ids: '1,2' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RequisitosServicoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('exige descrição', () => {
    component.confirmar();
    expect(component.erro).toContain('Descreva');
    httpMock.expectNone((r) => r.url.endsWith('/budgets'));
  });

  it('cria um orçamento por serviço selecionado', () => {
    component.descricao = 'Preciso de reparo';
    component.confirmar();
    const reqs = httpMock.match((r) => r.url.endsWith('/budgets') && r.method === 'POST');
    expect(reqs.length).toBe(2);
    expect(reqs[0].request.body.serviceId).toBe(1);
    expect(reqs[1].request.body.serviceId).toBe(2);
    reqs.forEach((r) => r.flush({ message: 'ok', budget: { id: 1 } }));
  });
});
