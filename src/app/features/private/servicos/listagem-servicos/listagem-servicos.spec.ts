import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListagemServicos } from './listagem-servicos';

describe('ListagemServicos', () => {
  let component: ListagemServicos;
  let fixture: ComponentFixture<ListagemServicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemServicos],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemServicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
