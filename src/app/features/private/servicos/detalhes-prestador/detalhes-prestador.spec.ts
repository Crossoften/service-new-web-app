import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesPrestador } from './detalhes-prestador';

describe('DetalhesPrestador', () => {
  let component: DetalhesPrestador;
  let fixture: ComponentFixture<DetalhesPrestador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesPrestador],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesPrestador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
