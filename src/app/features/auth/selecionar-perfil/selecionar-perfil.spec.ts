import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecionarPerfilComponent } from './selecionar-perfil';

describe('SelecionarPerfilComponent', () => {
  let component: SelecionarPerfilComponent;
  let fixture: ComponentFixture<SelecionarPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecionarPerfilComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecionarPerfilComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
