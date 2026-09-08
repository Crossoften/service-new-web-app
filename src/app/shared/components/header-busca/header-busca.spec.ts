import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeaderBuscaComponent } from './header-busca';

describe('HeaderBuscaComponent', () => {
  let component: HeaderBuscaComponent;
  let fixture: ComponentFixture<HeaderBuscaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderBuscaComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderBuscaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('enderecoLabel usa "Adicionar endereço" quando vazio (sem mock)', () => {
    expect(component.enderecoLabel).toBe('Adicionar endereço');
    component.endereco = 'Rua A, 10 - Centro';
    expect(component.enderecoLabel).toBe('Rua A, 10 - Centro');
  });

  it('emite buscarChange ao digitar', () => {
    let valor = '';
    component.buscarChange.subscribe((v) => (valor = v));
    component.onBuscar({ target: { value: 'pizza' } } as unknown as Event);
    expect(valor).toBe('pizza');
  });
});
