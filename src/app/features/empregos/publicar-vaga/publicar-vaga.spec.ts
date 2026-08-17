import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { PublicarVagaComponent } from './publicar-vaga';

describe('PublicarVagaComponent', () => {
  let component: PublicarVagaComponent;
  let fixture: ComponentFixture<PublicarVagaComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicarVagaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicarVagaComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('exige título', () => {
    component.salvar();
    expect(component.erro).toContain('título');
    httpMock.expectNone((r) => r.url.endsWith('/jobs'));
  });

  it('publica a vaga (POST /jobs)', () => {
    component.titulo = 'Dev Back-end';
    component.tipo = 'PJ';
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/jobs') && r.method === 'POST');
    expect(req.request.body.title).toBe('Dev Back-end');
    expect(req.request.body.type).toBe('PJ');
    req.flush({ message: 'ok', job: { id: 1 } });
  });
});
