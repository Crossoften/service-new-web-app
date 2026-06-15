import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeuCodigo } from './meu-codigo';

describe('MeuCodigo', () => {
  let component: MeuCodigo;
  let fixture: ComponentFixture<MeuCodigo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeuCodigo],
    }).compileComponents();

    fixture = TestBed.createComponent(MeuCodigo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
