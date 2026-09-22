import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SwPush } from '@angular/service-worker';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PerfilComponent } from './perfil';
import { PushService } from '../../../core/services/push';

// Sem service worker no teste: SwPush inativo.
const swPushStub = {
  isEnabled: false,
  subscription: of(null),
  requestSubscription: () => Promise.reject(new Error('sem sw')),
  unsubscribe: () => Promise.resolve(),
};

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SwPush, useValue: swPushStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onCoordenadas atualiza latitude/longitude do endereço', () => {
    component.onCoordenadas({ latitude: '-18.9', longitude: '-48.2' });
    expect(component.latitude).toBe('-18.9');
    expect(component.longitude).toBe('-48.2');
  });

  it('salvarEndereco preserva latitude/longitude no PATCH', () => {
    component.latitude = '-18.9186';
    component.longitude = '-48.2772';
    component.salvarEndereco();
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/profile/me/address') && r.method === 'PATCH',
    );
    expect(req.request.body.latitude).toBe('-18.9186');
    expect(req.request.body.longitude).toBe('-48.2772');
    req.flush({});
  });

  it('irContaRecebimento() leva ao vínculo do Mercado Pago', () => {
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.irContaRecebimento();
    expect(nav).toHaveBeenCalledWith(['/fornecedor/mercado-pago']);
  });

  it('perfil começa em modo leitura (não editando)', () => {
    expect(component.editandoDados).toBe(false);
    expect(component.editandoEndereco).toBe(false);
  });

  it('editarDados abre o formulário de dados', () => {
    component.editarDados();
    expect(component.editandoDados).toBe(true);
  });

  it('cancelarDados descarta alterações e fecha o formulário', () => {
    component.perfil = { name: 'Ana' } as never;
    component.nome = 'Ana';
    component.editandoDados = true;
    component.nome = 'Alterado';
    component.cancelarDados();
    expect(component.nome).toBe('Ana');
    expect(component.editandoDados).toBe(false);
  });

  it('editarEndereco/cancelarEndereco alternam o modo', () => {
    component.perfil = { name: 'Ana' } as never;
    component.editarEndereco();
    expect(component.editandoEndereco).toBe(true);
    component.cancelarEndereco();
    expect(component.editandoEndereco).toBe(false);
  });

  it('ativarNotificacoes sem service worker informa indisponível (não quebra) — §8.10', async () => {
    await component.ativarNotificacoes();
    expect(component.notificacoesAtivas).toBe(false);
    expect(component.pushMsg.length).toBeGreaterThan(0);
  });

  it('sair() cancela a inscrição push antes de deslogar (§8.10)', async () => {
    const push = TestBed.inject(PushService);
    const desativar = vi.spyOn(push, 'desativar').mockResolvedValue();
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    await component.sair();
    expect(desativar).toHaveBeenCalled();
    expect(nav).toHaveBeenCalledWith(['/login']);
  });
});
