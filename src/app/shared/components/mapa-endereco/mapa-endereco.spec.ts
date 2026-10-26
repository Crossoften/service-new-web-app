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

  it('parseEndereco extrai rua/número/bairro/cidade/UF/CEP dos address_components (§3.2)', () => {
    const components = [
      { long_name: '1578', short_name: '1578', types: ['street_number'] },
      { long_name: 'Avenida Paulista', short_name: 'Av. Paulista', types: ['route'] },
      { long_name: 'Bela Vista', short_name: 'Bela Vista', types: ['sublocality_level_1', 'sublocality'] },
      { long_name: 'São Paulo', short_name: 'São Paulo', types: ['administrative_area_level_2'] },
      { long_name: 'São Paulo', short_name: 'SP', types: ['administrative_area_level_1'] },
      { long_name: '01310-200', short_name: '01310-200', types: ['postal_code'] },
    ];
    const end = (component as unknown as { parseEndereco(c: unknown[]): unknown }).parseEndereco(components);
    expect(end).toEqual({
      street: 'Avenida Paulista',
      number: '1578',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-200',
    });
  });

  it('parseEndereco retorna null quando não há components aproveitáveis', () => {
    const parse = (component as unknown as { parseEndereco(c?: unknown[]): unknown }).parseEndereco;
    expect(parse.call(component, undefined)).toBeNull();
    expect(parse.call(component, [])).toBeNull();
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
