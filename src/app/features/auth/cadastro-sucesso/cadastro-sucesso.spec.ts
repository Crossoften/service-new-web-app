import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroSucessoComponent } from './cadastro-sucesso';

describe('CadastroSucessoComponent', () => {
  let component: CadastroSucessoComponent;
  let fixture: ComponentFixture<CadastroSucessoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroSucessoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroSucessoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
