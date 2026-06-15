import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroSucesso } from './cadastro-sucesso';

describe('CadastroSucesso', () => {
  let component: CadastroSucesso;
  let fixture: ComponentFixture<CadastroSucesso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroSucesso],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroSucesso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
