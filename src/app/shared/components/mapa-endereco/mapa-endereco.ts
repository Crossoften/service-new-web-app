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
        fields: ['geometry'],
      });
      this.autocomplete.addListener('place_changed', () => {
        const place = this.autocomplete.getPlace();
        const loc = place?.geometry?.location;
        if (!loc) return;
        this.map.setCenter(loc);
        this.map.setZoom(16);
        this.marker.setPosition(loc);
        this.marker.setVisible(true);
        this.emitir(loc);
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
}
