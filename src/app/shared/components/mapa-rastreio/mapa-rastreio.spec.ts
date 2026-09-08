import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MapaRastreioComponent } from './mapa-rastreio';

describe('MapaRastreioComponent', () => {
  let component: MapaRastreioComponent;
  let fixture: ComponentFixture<MapaRastreioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaRastreioComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaRastreioComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sem chave do Maps, marca indisponível e mostra fallback textual', async () => {
    component.latInicial = '-18.9';
    component.lngInicial = '-48.2';
    fixture.detectChanges();
    // O loader rejeita (sem chave) de forma assíncrona → cai no fallback.
    await Promise.resolve();
    await Promise.resolve();
    expect(component.indisponivel).toBe(true);
    expect(component.temPosicao).toBe(true);
  });
});
