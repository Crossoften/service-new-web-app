import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { HubFornecedorComponent } from './hub-fornecedor';

describe('HubFornecedorComponent', () => {
  let component: HubFornecedorComponent;
  let fixture: ComponentFixture<HubFornecedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HubFornecedorComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HubFornecedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('lista as verticais do fornecedor', () => {
    expect(component.verticais.length).toBeGreaterThanOrEqual(6);
    const rotas = component.verticais.map((v) => v.rota);
    expect(rotas).toContain('/fornecedor/home'); // delivery
    expect(rotas).toContain('/fornecedor/servicos'); // serviços
  });

  it('abrir() navega para a rota da vertical', () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate');
    component.abrir(component.verticais[0]);
    expect(nav).toHaveBeenCalledWith([component.verticais[0].rota]);
  });

  it('irPerfil() navega para o perfil do fornecedor', () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate');
    component.irPerfil();
    expect(nav).toHaveBeenCalledWith(['/fornecedor/perfil']);
  });
});
