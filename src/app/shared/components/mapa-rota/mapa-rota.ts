import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader';

declare const google: any;

/**
 * Mapa de rota da entrega (entregador): traça o caminho **coleta → entrega**
 * (Google Maps Directions) e marca a posição do entregador, quando houver.
 *
 * Coordenadas vêm em texto e são **opcionais** — o pai só monta este componente
 * quando coleta e entrega têm coordenada. Sem chave do Maps, ou se a Directions
 * API não estiver habilitada, cai num fallback que mostra os dois pontos (ou o
 * aviso), nunca deixa a tela quebrada.
 */
@Component({
  selector: 'app-mapa-rota',
  imports: [],
  templateUrl: './mapa-rota.html',
  styleUrl: './mapa-rota.scss',
})
export class MapaRotaComponent implements OnInit, OnChanges {
  private readonly loader = inject(GoogleMapsLoaderService);

  @ViewChild('mapa') mapaRef?: ElementRef<HTMLDivElement>;

  @Input() coletaLat?: string | null;
  @Input() coletaLng?: string | null;
  @Input() entregaLat?: string | null;
  @Input() entregaLng?: string | null;
  /** Posição do entregador (última conhecida), opcional. */
  @Input() entregadorLat?: string | null;
  @Input() entregadorLng?: string | null;

  carregando = true;
  indisponivel = false;

  private map: any;
  private renderer: any;
  private entregadorMarker: any;
  private pronto = false;

  ngOnInit() {
    const coleta = this.coords(this.coletaLat, this.coletaLng);
    const entrega = this.coords(this.entregaLat, this.entregaLng);
    if (!coleta || !entrega) {
      this.carregando = false;
      this.indisponivel = true;
      return;
    }
    this.loader
      .load()
      .then(() => this.inicializar(coleta, entrega))
      .catch(() => {
        this.carregando = false;
        this.indisponivel = true;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.pronto && (changes['entregadorLat'] || changes['entregadorLng'])) {
      this.posicionarEntregador();
    }
  }

  private inicializar(coleta: LatLng, entrega: LatLng) {
    this.carregando = false;
    this.pronto = true;
    if (!this.mapaRef) return;

    this.map = new google.maps.Map(this.mapaRef.nativeElement, {
      center: coleta,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
    });

    const svc = new google.maps.DirectionsService();
    this.renderer = new google.maps.DirectionsRenderer({ map: this.map });
    svc.route(
      { origin: coleta, destination: entrega, travelMode: google.maps.TravelMode.DRIVING },
      (res: any, status: any) => {
        if (status === 'OK') {
          this.renderer.setDirections(res);
        } else {
          // Directions indisponível (ex.: API não habilitada na chave): mostra os
          // dois pontos sem a linha da rota, ainda útil para o entregador.
          new google.maps.Marker({ position: coleta, map: this.map, label: 'C' });
          new google.maps.Marker({ position: entrega, map: this.map, label: 'E' });
          const b = new google.maps.LatLngBounds();
          b.extend(coleta);
          b.extend(entrega);
          this.map.fitBounds(b);
        }
      },
    );

    this.posicionarEntregador();
  }

  private posicionarEntregador() {
    const pos = this.coords(this.entregadorLat, this.entregadorLng);
    if (!pos || !this.map) return;
    if (!this.entregadorMarker) {
      this.entregadorMarker = new google.maps.Marker({ position: pos, map: this.map, title: 'Você' });
    } else {
      this.entregadorMarker.setPosition(pos);
    }
  }

  private coords(lat?: string | null, lng?: string | null): LatLng | undefined {
    const nlat = Number(lat);
    const nlng = Number(lng);
    if (!lat || !lng || !Number.isFinite(nlat) || !Number.isFinite(nlng)) return undefined;
    return { lat: nlat, lng: nlng };
  }
}

interface LatLng {
  lat: number;
  lng: number;
}
