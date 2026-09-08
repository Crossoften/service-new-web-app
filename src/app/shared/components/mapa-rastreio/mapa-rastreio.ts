import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader';
import {
  DeliveryLocation,
  DeliveryTrackingService,
} from '../../../core/services/delivery-tracking';

declare const google: any;

/**
 * Mapa de acompanhamento da entrega em tempo real (Fase 8.4), somente leitura.
 *
 * Enquanto `ativo` é verdadeiro, entra no canal WebSocket da entrega
 * (`track(deliveryId)`) e move o pino a cada `delivery:location`. Antes do
 * primeiro evento, usa a última posição já persistida no pedido
 * (`latInicial/lngInicial`, vinda do polling).
 *
 * Sem chave do Maps (ou sem posição), cai num painel textual — nunca quebra a
 * tela nem deixa o mapa em branco.
 */
@Component({
  selector: 'app-mapa-rastreio',
  imports: [CommonModule],
  templateUrl: './mapa-rastreio.html',
  styleUrl: './mapa-rastreio.scss',
})
export class MapaRastreioComponent implements OnInit, OnChanges, OnDestroy {
  private readonly loader = inject(GoogleMapsLoaderService);
  private readonly tracking = inject(DeliveryTrackingService);

  @ViewChild('mapa') mapaRef?: ElementRef<HTMLDivElement>;

  @Input() deliveryId?: number;
  @Input() latInicial?: string | null;
  @Input() lngInicial?: string | null;
  /** Rastrear ao vivo (só quando a entrega está a caminho). */
  @Input() ativo = false;

  carregando = true;
  indisponivel = false;

  /** Última posição conhecida (para o fallback textual). */
  lat?: string;
  lng?: string;

  private map: any;
  private marker: any;
  private pronto = false;
  private rastreando = false;
  private locSub?: Subscription;

  get temPosicao(): boolean {
    return !!this.lat && !!this.lng;
  }

  ngOnInit() {
    this.lat = this.latInicial ?? undefined;
    this.lng = this.lngInicial ?? undefined;
    this.loader
      .load()
      .then(() => this.inicializar())
      .catch(() => {
        this.carregando = false;
        this.indisponivel = true;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Posição inicial pode chegar depois (polling do pedido) — reposiciona o pino.
    if (changes['latInicial'] || changes['lngInicial']) {
      if (!this.rastreando) {
        this.lat = this.latInicial ?? this.lat;
        this.lng = this.lngInicial ?? this.lng;
        this.posicionar(this.lat, this.lng);
      }
    }
    if (changes['ativo'] || changes['deliveryId']) {
      this.ativo ? this.iniciarRastreio() : this.pararRastreio();
    }
  }

  ngOnDestroy() {
    this.pararRastreio();
  }

  private inicializar() {
    this.carregando = false;
    this.pronto = true;
    if (!this.mapaRef) return;

    const centro = this.paraLatLng(this.lat, this.lng) ?? { lat: -15.78, lng: -47.93 };
    this.map = new google.maps.Map(this.mapaRef.nativeElement, {
      center: centro,
      zoom: this.temPosicao ? 16 : 4,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
    });
    this.marker = new google.maps.Marker({
      position: centro,
      map: this.map,
      visible: this.temPosicao,
    });
    if (this.ativo) this.iniciarRastreio();
  }

  private iniciarRastreio() {
    if (this.rastreando || this.deliveryId == null) return;
    this.rastreando = true;
    this.locSub = this.tracking.onLocation().subscribe((p: DeliveryLocation) => {
      if (this.deliveryId != null && p.deliveryId !== this.deliveryId) return;
      this.lat = String(p.lat);
      this.lng = String(p.lng);
      this.posicionar(this.lat, this.lng);
    });
    this.tracking.track(this.deliveryId);
  }

  private pararRastreio() {
    if (this.deliveryId != null) this.tracking.untrack(this.deliveryId);
    this.locSub?.unsubscribe();
    this.locSub = undefined;
    this.rastreando = false;
  }

  private posicionar(lat?: string, lng?: string) {
    const pos = this.paraLatLng(lat, lng);
    if (!pos || !this.pronto || !this.marker) return;
    this.marker.setPosition(pos);
    this.marker.setVisible(true);
    this.map.setCenter(pos);
    if (this.map.getZoom() < 15) this.map.setZoom(16);
  }

  private paraLatLng(lat?: string, lng?: string): { lat: number; lng: number } | undefined {
    const nlat = Number(lat);
    const nlng = Number(lng);
    if (!lat || !lng || !Number.isFinite(nlat) || !Number.isFinite(nlng)) return undefined;
    return { lat: nlat, lng: nlng };
  }
}
