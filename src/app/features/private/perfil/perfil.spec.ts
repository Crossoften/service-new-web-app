import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PerfilComponent } from './perfil';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
});
