import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapaRotaComponent } from './mapa-rota';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader';

describe('MapaRotaComponent', () => {
  let component: MapaRotaComponent;
  let fixture: ComponentFixture<MapaRotaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaRotaComponent],
      providers: [
        // Loader nunca resolve no teste: evita tocar no SDK do Google Maps.
        { provide: GoogleMapsLoaderService, useValue: { load: () => new Promise(() => {}) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MapaRotaComponent);
    component = fixture.componentInstance;
  });

  it('sem coordenadas completas → indisponível (não tenta carregar o mapa)', () => {
    component.coletaLat = '-23.5';
    component.coletaLng = '-46.6';
    component.entregaLat = null; // falta a entrega
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.indisponivel).toBe(true);
    expect(component.carregando).toBe(false);
  });

  it('com coleta e entrega → tenta carregar (fica carregando até o loader resolver)', () => {
    component.coletaLat = '-23.5';
    component.coletaLng = '-46.6';
    component.entregaLat = '-23.6';
    component.entregaLng = '-46.7';
    component.ngOnInit();
    expect(component.indisponivel).toBe(false);
    expect(component.carregando).toBe(true);
  });
});
