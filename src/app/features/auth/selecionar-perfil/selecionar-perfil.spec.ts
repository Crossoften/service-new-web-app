import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecionarPerfil } from './selecionar-perfil';

describe('SelecionarPerfil', () => {
  let component: SelecionarPerfil;
  let fixture: ComponentFixture<SelecionarPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecionarPerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecionarPerfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
