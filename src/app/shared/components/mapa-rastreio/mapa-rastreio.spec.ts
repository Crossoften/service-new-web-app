import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MapaRastreioComponent } from './mapa-rastreio';
import { environment } from '../../../../environments/environment';

describe('MapaRastreioComponent', () => {
  let component: MapaRastreioComponent;
  let fixture: ComponentFixture<MapaRastreioComponent>;
  let chaveOriginal: string;

  beforeEach(async () => {
    // Valida o fallback "sem chave"; o ambiente de dev traz uma chave real,
    // então zeramos aqui e restauramos no afterEach.
    chaveOriginal = environment.googleMapsApiKey;
    environment.googleMapsApiKey = '';

    await TestBed.configureTestingModule({
      imports: [MapaRastreioComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaRastreioComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    environment.googleMapsApiKey = chaveOriginal;
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
