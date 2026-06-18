import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavFornecedorServicos } from './bottom-nav-fornecedor-servicos';

describe('BottomNavFornecedorServicos', () => {
  let component: BottomNavFornecedorServicos;
  let fixture: ComponentFixture<BottomNavFornecedorServicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavFornecedorServicos],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavFornecedorServicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
