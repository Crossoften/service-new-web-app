import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader';

declare const google: any;

export interface Coordenadas {
  latitude: string;
  longitude: string;
}

/** Endereço extraído do resultado do Places Autocomplete (§3.2). */
export interface EnderecoMapa {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Seletor de coordenadas no mapa (Fase 8.4). Busca por endereço (Places
 * Autocomplete), pino arrastável e clique no mapa. Emite `latitude/longitude`
 * como string (o back aceita string/número e devolve string).
 *
 * Sem chave do Maps, exibe aviso e não quebra a tela — o cadastro segue sem coords.
 */
@Component({
  selector: 'app-mapa-endereco',
  imports: [CommonModule],
  templateUrl: './mapa-endereco.html',
  styleUrl: './mapa-endereco.scss',
})
export class MapaEnderecoComponent implements OnInit, OnDestroy {
  private readonly loader = inject(GoogleMapsLoaderService);

  @ViewChild('mapa') mapaRef?: ElementRef<HTMLDivElement>;
  @ViewChild('busca') buscaRef?: ElementRef<HTMLInputElement>;

  @Input() latitude?: string;
  @Input() longitude?: string;

  @Output() coordenadas = new EventEmitter<Coordenadas>();
  @Output() endereco = new EventEmitter<EnderecoMapa>();

  carregando = true;
  indisponivel = false;

  private map: any;
  private marker: any;
  private autocomplete: any;

  ngOnInit() {
    this.loader
      .load()
      .then(() => this.inicializar())
      .catch(() => {
        this.carregando = false;
        this.indisponivel = true;
      });
  }

  private inicializar() {
    this.carregando = false;
    if (!this.mapaRef) return;

    const lat = Number(this.latitude);
    const lng = Number(this.longitude);
    const temCoords = Number.isFinite(lat) && Number.isFinite(lng) && !!this.latitude && !!this.longitude;
    const centro = temCoords ? { lat, lng } : { lat: -15.78, lng: -47.93 }; // centro do Brasil

    this.map = new google.maps.Map(this.mapaRef.nativeElement, {
      center: centro,
      zoom: temCoords ? 16 : 4,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
    });

    this.marker = new google.maps.Marker({
      position: centro,
      map: this.map,
      draggable: true,
      visible: temCoords,
    });
    this.marker.addListener('dragend', () => this.emitir(this.marker.getPosition()));
    this.map.addListener('click', (e: any) => {
      this.marker.setPosition(e.latLng);
      this.marker.setVisible(true);
      this.emitir(e.latLng);
    });

    if (this.buscaRef) {
      this.autocomplete = new google.maps.places.Autocomplete(this.buscaRef.nativeElement, {
        fields: ['geometry', 'address_components'],
      });
      this.autocomplete.addListener('place_changed', () => {
        const place = this.autocomplete.getPlace();
        const loc = place?.geometry?.location;
        if (loc) {
          this.map.setCenter(loc);
          this.map.setZoom(16);
          this.marker.setPosition(loc);
          this.marker.setVisible(true);
          this.emitir(loc);
        }
        const end = this.parseEndereco(place?.address_components);
        if (end) this.endereco.emit(end);
      });
    }
  }

  /**
   * O Places Autocomplete injeta um `.pac-container` no `<body>`. Sem esta
   * limpeza, ele fica pendurado (vazio, só com `border-top`) e aparece como uma
   * "linha" em todas as telas seguintes. Removemos o container e os listeners.
   */
  ngOnDestroy() {
    if (this.autocomplete && typeof google !== 'undefined') {
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }
    document.querySelectorAll('.pac-container').forEach((el) => el.remove());
  }

  private emitir(latLng: any) {
    const latitude = String(latLng.lat());
    const longitude = String(latLng.lng());
    this.latitude = latitude;
    this.longitude = longitude;
    this.coordenadas.emit({ latitude, longitude });
  }

  /**
   * Extrai rua/número/bairro/cidade/UF/CEP dos `address_components` do Places.
   * UF usa `short_name` (sigla). Retorna `null` se nada aproveitável veio.
   */
  private parseEndereco(components: any[] | undefined): EnderecoMapa | null {
    if (!components?.length) return null;
    const get = (type: string, short = false): string => {
      const c = components.find((x) => x.types?.includes(type));
      return c ? (short ? c.short_name : c.long_name) : '';
    };
    const endereco: EnderecoMapa = {
      street: get('route'),
      number: get('street_number'),
      neighborhood: get('sublocality_level_1') || get('sublocality') || get('neighborhood'),
      city: get('administrative_area_level_2') || get('locality'),
      state: get('administrative_area_level_1', true),
      zipCode: get('postal_code'),
    };
    return Object.values(endereco).some((v) => v) ? endereco : null;
  }
}
