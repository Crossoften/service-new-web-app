import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaEnderecoComponent } from './mapa-endereco';

describe('MapaEnderecoComponent', () => {
  let component: MapaEnderecoComponent;
  let fixture: ComponentFixture<MapaEnderecoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaEnderecoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaEnderecoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sem chave do Maps, marca indisponível e não quebra', async () => {
    fixture.detectChanges(); // dispara ngOnInit → loader.load() rejeita (sem chave)
    await fixture.whenStable();
    expect(component.indisponivel).toBe(true);
    expect(component.carregando).toBe(false);
  });
});
