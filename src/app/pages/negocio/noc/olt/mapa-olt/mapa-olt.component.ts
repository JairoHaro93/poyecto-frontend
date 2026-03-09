import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { environment } from '../../../../../../environments/environment.development';

import { CajasService } from '../../../../../services/negocio_latacunga/cajas.services';
import { ICajas } from '../../../../../interfaces/negocio/infraestructura/icajas.interface';

type LatLngLiteral = google.maps.LatLngLiteral;

export interface IOltMapSelection {
  cajaId: number;
  cajaNombre: string;
  cajaTipo: string;
  oltId: number | null;
  oltNombre?: string | null;
  coords?: string | null;
}

type MarkerVm = {
  id: number;
  position: google.maps.LatLngLiteral;
  title: string;
  labelTop: string;
  caja: ICajas;
  options: google.maps.MarkerOptions;
};

@Component({
  selector: 'app-mapa-olt',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapMarker],
  templateUrl: './mapa-olt.component.html',
  styleUrls: ['./mapa-olt.component.css'],
})
export class MapaOltComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() cajaSelected = new EventEmitter<IOltMapSelection>();

  @ViewChild(GoogleMap) mapRef!: GoogleMap;

  constructor(private cajasService: CajasService) {}

  isGoogleMapsLoaded = false;
  isReady = false;
  cargando = false;

  myposition = signal<google.maps.LatLng | null>(null);
  zoom = signal<number>(13);

  cajas: ICajas[] = [];
  markers: MarkerVm[] = [];

  selectedCaja = signal<ICajas | null>(null);

  private readonly ICON_SIZE_PX = 32;
  private readonly LABEL_FONT_SIZE_PX = 12;
  private readonly LABEL_PAD_Y_PX = 5;
  private readonly LABEL_PAD_X_PX = 10;
  private readonly LABEL_BORDER_PX = 2;
  private readonly LABEL_OFFSET_EXTRA_PX = 15;

  private readonly DEFAULT_CENTER: LatLngLiteral = {
    lat: -0.9398,
    lng: -78.616569,
  };

  private getLabelOffsetPx(iconPx: number): number {
    return Math.round(iconPx / 2 + this.LABEL_OFFSET_EXTRA_PX);
  }

  private iconCache = new Map<string, google.maps.Icon>();
  private labelOverlays = new Map<number, google.maps.OverlayView>();

  async ngOnInit(): Promise<void> {
    try {
      this.isReady = false;
      await this.loadGoogleMapsIfNeeded();
      this.initializeMap();
      await this.loadNapCajas();
      this.isReady = true;
    } catch (e) {
      console.error('Error iniciando mapa OLT:', e);
      this.isReady = true;
    }
  }

  ngAfterViewInit(): void {
    const waitForMap = () => {
      const map = this.mapRef?.googleMap;
      if (!map) {
        requestAnimationFrame(waitForMap);
        return;
      }

      map.setOptions({
        mapTypeId: 'satellite',
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
      });

      map.addListener('zoom_changed', () => {
        this.refreshLabelOverlays();
      });

      setTimeout(() => {
        this.refreshLabelOverlays();
      }, 0);
    };

    waitForMap();
  }

  ngOnDestroy(): void {
    this.clearLabelOverlays();
  }

  async reload(): Promise<void> {
    await this.loadNapCajas();
  }

  async centerOnCaja(cajaId: number): Promise<void> {
    const found = this.cajas.find((c) => c.id === cajaId);
    if (!found) return;

    const ll = this.parseCoords(found.caja_coordenadas || '');
    if (!ll) return;

    this.selectedCaja.set(found);
    this.myposition.set(new google.maps.LatLng(ll.lat, ll.lng));
    this.zoom.set(18);
  }

  onMarkerClick(marker: MarkerVm): void {
    this.selectedCaja.set(marker.caja);

    this.cajaSelected.emit({
      cajaId: marker.caja.id,
      cajaNombre: marker.caja.caja_nombre || `Caja ${marker.caja.id}`,
      cajaTipo: marker.caja.caja_tipo || 'NAP',
      oltId:
        (marker.caja as any).olt_id != null
          ? Number((marker.caja as any).olt_id)
          : null,
      oltNombre: (marker.caja as any).olt_nombre ?? null,
      coords: marker.caja.caja_coordenadas ?? null,
    });

    const ll = this.parseCoords(marker.caja.caja_coordenadas || '');
    if (ll) {
      this.myposition.set(new google.maps.LatLng(ll.lat, ll.lng));
      this.zoom.set(18);
    }
  }

  usarCajaSeleccionada(): void {
    const caja = this.selectedCaja();
    if (!caja) return;

    this.cajaSelected.emit({
      cajaId: caja.id,
      cajaNombre: caja.caja_nombre || `Caja ${caja.id}`,
      cajaTipo: caja.caja_tipo || 'NAP',
      oltId: (caja as any).olt_id != null ? Number((caja as any).olt_id) : null,
      oltNombre: (caja as any).olt_nombre ?? null,
      coords: caja.caja_coordenadas ?? null,
    });
  }

  hasOlt(caja: ICajas | null): boolean {
    return !!caja && Number.isFinite(Number((caja as any).olt_id));
  }

  private async loadNapCajas(): Promise<void> {
    this.cargando = true;
    try {
      const data = await this.cajasService.getCajas({
        tipo: 'NAP',
        limit: 5000,
      });

      const cajas = (data || []).filter((c) => {
        const tipo = String(c.caja_tipo || '').toUpperCase();
        return tipo === 'NAP';
      });

      this.cajas = cajas;
      this.markers = cajas
        .map((c) => this.mapCajaToMarker(c))
        .filter(Boolean) as MarkerVm[];

      if (this.markers.length) {
        const first = this.markers[0].position;
        this.myposition.set(new google.maps.LatLng(first.lat, first.lng));
      } else {
        this.myposition.set(
          new google.maps.LatLng(
            this.DEFAULT_CENTER.lat,
            this.DEFAULT_CENTER.lng,
          ),
        );
      }

      this.refreshLabelOverlays();
    } catch (e) {
      console.error('Error cargando NAPs para mapa OLT:', e);
      this.cajas = [];
      this.markers = [];
      this.clearLabelOverlays();

      this.myposition.set(
        new google.maps.LatLng(
          this.DEFAULT_CENTER.lat,
          this.DEFAULT_CENTER.lng,
        ),
      );
    } finally {
      this.cargando = false;
    }
  }

  private initializeMap(): void {
    if (!this.isGoogleMapsLoaded) return;
    this.myposition.set(
      new google.maps.LatLng(this.DEFAULT_CENTER.lat, this.DEFAULT_CENTER.lng),
    );
    this.zoom.set(13);
  }

  private loadGoogleMapsIfNeeded(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google?.maps) {
        this.isGoogleMapsLoaded = true;
        resolve();
        return;
      }

      const existing = document.querySelector<HTMLScriptElement>(
        'script[src*="maps.googleapis.com/maps/api/js"]',
      );

      const onReady = () => {
        this.isGoogleMapsLoaded = true;
        resolve();
      };
      const onError = () => reject(new Error('No se pudo cargar Google Maps'));

      if (existing) {
        existing.addEventListener('load', onReady, { once: true });
        existing.addEventListener('error', onError, { once: true });

        const start = Date.now();
        const iv = setInterval(() => {
          if ((window as any).google?.maps) {
            clearInterval(iv);
            onReady();
          } else if (Date.now() - start > 15000) {
            clearInterval(iv);
            onError();
          }
        }, 150);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.token_map}`;
      script.defer = true;
      script.async = true;
      script.onload = onReady;
      script.onerror = onError;
      document.head.appendChild(script);
    });
  }

  private parseCoords(coords: string): LatLngLiteral | null {
    const [la, ln] = String(coords || '')
      .split(',')
      .map((s) => Number((s || '').trim()));

    if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
    return { lat: la, lng: ln };
  }

  private mapCajaToMarker(c: ICajas): MarkerVm | null {
    let lat = Number((c as any).lat);
    let lng = Number((c as any).lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const parsed = this.parseCoords(c.caja_coordenadas || '');
      if (!parsed) return null;
      lat = parsed.lat;
      lng = parsed.lng;
    }

    return {
      id: c.id,
      position: { lat, lng },
      title: String(c.caja_nombre || `Caja ${c.id}`),
      labelTop: String(c.caja_nombre || `Caja ${c.id}`),
      caja: c,
      options: {
        icon: this.makeIcon(c),
        optimized: false,
        zIndex: 10,
      },
    };
  }

  private makeIcon(c: ICajas): google.maps.Icon {
    const hasOlt = this.hasOlt(c);
    const estado = String(c.caja_estado || '').toUpperCase();
    const px = this.ICON_SIZE_PX;

    let fill = '#6b7280';
    let stroke = '#111827';

    if (hasOlt) {
      fill = '#16a34a';
      stroke = '#14532d';
    }

    if (estado === 'DISEÑO') {
      fill = hasOlt ? '#f59e0b' : '#9ca3af';
      stroke = '#78350f';
    }

    if (estado === 'FULL') {
      fill = '#dc2626';
      stroke = '#7f1d1d';
    }

    const key = `${fill}|${stroke}|${px}`;
    const cached = this.iconCache.get(key);
    if (cached) return cached;

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 48 48">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>
  <rect x="10" y="10" width="28" height="28" rx="5" ry="5"
        fill="${fill}" stroke="${stroke}" stroke-width="3" filter="url(#shadow)"/>
</svg>`.trim();

    const url = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);

    const icon: google.maps.Icon = {
      url,
      size: new google.maps.Size(px, px),
      scaledSize: new google.maps.Size(px, px),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(px / 2, px / 0.94),
    };

    this.iconCache.set(key, icon);
    return icon;
  }

  private clearLabelOverlays() {
    this.labelOverlays.forEach((ov) => ov.setMap(null as any));
    this.labelOverlays.clear();
  }

  private refreshLabelOverlays() {
    const gmap = this.mapRef?.googleMap;
    if (!gmap) return;

    this.clearLabelOverlays();

    const offsetPx = this.getLabelOffsetPx(this.ICON_SIZE_PX);

    for (const m of this.markers) {
      const overlay = this.createNameOverlay(m.position, m.labelTop, offsetPx);
      overlay.setMap(gmap);
      this.labelOverlays.set(m.id, overlay);
    }
  }
  private createNameOverlay(
    pos: google.maps.LatLngLiteral,
    text: string,
    offsetY: number,
  ) {
    const fontSize = this.LABEL_FONT_SIZE_PX;
    const padY = this.LABEL_PAD_Y_PX;
    const padX = this.LABEL_PAD_X_PX;
    const borderPx = this.LABEL_BORDER_PX;

    class NameOverlay extends google.maps.OverlayView {
      private div?: HTMLDivElement;
      private position: google.maps.LatLngLiteral = pos;
      private label: string = text;

      override onAdd(): void {
        this.div = document.createElement('div');
        this.div.textContent = this.label;

        Object.assign(this.div.style, {
          position: 'absolute',
          pointerEvents: 'none',
          background: '#ce2929',
          color: '#ffffff',
          fontSize: `${fontSize}px`,
          fontWeight: '700',
          lineHeight: '1',
          padding: `${padY}px ${padX}px`,
          border: `${borderPx}px solid #ffffff`,
          borderRadius: '999px',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 10px rgba(0,0,0,0.22)',
          userSelect: 'none',
          zIndex: '300',
          transform: 'translate(-50%, -100%)',
          textTransform: 'uppercase',
          fontFamily: 'Arial, sans-serif',
        } as CSSStyleDeclaration);

        const panes = this.getPanes();
        panes?.floatPane.appendChild(this.div);
      }

      override draw(): void {
        if (!this.div) return;

        const projection = this.getProjection();
        if (!projection) return;

        const ll = new google.maps.LatLng(this.position.lat, this.position.lng);
        const point = projection.fromLatLngToDivPixel(ll);
        if (!point) return;

        this.div.style.left = `${Math.round(point.x)}px`;
        this.div.style.top = `${Math.round(point.y - offsetY)}px`;
      }

      override onRemove(): void {
        if (this.div?.parentNode) {
          this.div.parentNode.removeChild(this.div);
        }
        this.div = undefined;
      }

      setText(t: string) {
        this.label = t;
        if (this.div) this.div.textContent = t;
      }

      setPosition(p: google.maps.LatLngLiteral) {
        this.position = p;
        this.draw();
      }
    }

    return new NameOverlay();
  }
}
