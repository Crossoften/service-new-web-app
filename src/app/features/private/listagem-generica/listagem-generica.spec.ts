import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListagemGenerica } from './listagem-generica';

describe('ListagemGenerica', () => {
  let component: ListagemGenerica;
  let fixture: ComponentFixture<ListagemGenerica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemGenerica],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemGenerica);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
