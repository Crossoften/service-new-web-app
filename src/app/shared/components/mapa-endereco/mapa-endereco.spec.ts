import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { MapaEnderecoComponent } from './mapa-endereco';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader';

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

  it('quando o Maps falha ao carregar, marca indisponível e não quebra', async () => {
    // Independente da chave configurada: força a falha do loader.
    const loader = TestBed.inject(GoogleMapsLoaderService);
    vi.spyOn(loader, 'load').mockRejectedValue(new Error('sem maps'));
    fixture.detectChanges(); // dispara ngOnInit → loader.load() rejeita
    await fixture.whenStable();
    expect(component.indisponivel).toBe(true);
    expect(component.carregando).toBe(false);
  });

  it('ngOnDestroy remove o .pac-container solto do body (fim da "linha")', () => {
    const pac = document.createElement('div');
    pac.className = 'pac-container';
    document.body.appendChild(pac);
    expect(document.querySelectorAll('.pac-container').length).toBeGreaterThan(0);
    component.ngOnDestroy();
    expect(document.querySelectorAll('.pac-container').length).toBe(0);
  });
});
