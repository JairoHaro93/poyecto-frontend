import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  Output,
  EventEmitter,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { environment } from '../../../../../../environments/environment.development';

import { CajasService } from '../../../../../services/negocio_latacunga/cajas.services';
import { ICajas } from '../../../../../interfaces/negocio/infraestructura/icajas.interface';

type LatLngLiteral = google.maps.LatLngLiteral;
type StateColor = { fill: string; stroke: string; text?: string };
type Marker = {
  id: number;
  position: google.maps.LatLngLiteral;
  title: string;
  options: google.maps.MarkerOptions;
};

@Component({
  selector: 'app-mapa-cajas-view',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapMarker],
  templateUrl: './mapa-cajas-view.component.html',
  styleUrls: ['./mapa-cajas-view.component.css'],
})
export class MapaCajasViewComponent
  implements OnInit, OnChanges, AfterViewInit
{
  /** Modo selección (cursor mira y click para escoger coords) */
  @Input() picking = false;
  /** Coordenadas elegidas en formato "lat,lng" */
  @Input() selectedCoords: string | null = null;
  /** Cajas locales (recién creadas) para pintar INSTANTÁNEO */
  @Input() instantCajas: ICajas[] | null = null;
  /** Tamaño de iconos en px */
  @Input() iconSizePx = 56;

  /** Emite lat/lng al click en modo picking */
  @Output() mapClick = new EventEmitter<{ lat: number; lng: number }>();

  @ViewChild(GoogleMap) mapRef!: GoogleMap;

  private readonly cursorTargetRed =
    "url('data:image/svg+xml;utf8," +
    '<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 32 32%22>' +
    '<circle cx=%2216%22 cy=%2216%22 r=%224%22 fill=%22%23e50914%22/>' +
    '<circle cx=%2216%22 cy=%2216%22 r=%229%22 fill=%22none%22 stroke=%22%23e50914%22 stroke-width=%222%22/>' +
    '<path d=%22M16 1v6M16 25v6M1 16h6M25 16h6%22 stroke=%22%23e50914%22 stroke-width=%222%22/>' +
    "</svg>') 16 16, crosshair";

  isGoogleMapsLoaded = false;
  isReady = false;

  /** Marcadores finales mostrados (fusión de remotos + locales) */
  markers: Marker[] = [];
  /** Colecciones separadas para fusionar sin pisarnos */
  private fetched: Marker[] = [];
  private local: Marker[] = [];

  /** Cache de iconos SVG ya generados */
  private iconCache = new Map<string, google.maps.Icon>();

  /** Colores por ESTADO */
  private readonly STATE_COLORS: Record<string, StateColor> = {
    ACTIVO: { fill: '#16a34a', stroke: '#065f46', text: '#000000ff' }, // verde
    DISEÑO: { fill: '#eab308', stroke: '#92400e', text: '#111827' }, // amarillo
    MANTENIMIENTO: { fill: '#f97316', stroke: '#7c2d12', text: '#000000ff' }, // naranja
    INACTIVO: { fill: '#9ca3af', stroke: '#374151', text: '#111827' }, // gris
  };

  myposition = signal<any>(''); // center (google.maps.LatLng)
  zoom = signal<number>(12);

  // Centro por defecto (Latacunga aprox)
  private readonly DEFAULT_CENTER: LatLngLiteral = {
    lat: -0.9398,
    lng: -78.616569,
  };

  // Debounce de peticiones
  private idleTimer?: any;
  private inFlight = 0;

  constructor(private cajasService: CajasService) {}

  // ===== Ciclo de vida =====
  async ngOnInit() {
    try {
      this.isReady = false;
      await this.loadGoogleMapsIfNeeded();
      this.initializeMap();
      this.isReady = true;
    } catch (e) {
      console.error('Error iniciando mapa de cajas:', e);
      this.isReady = true;
    }
  }

  ngAfterViewInit() {
    const waitForMap = () => {
      const map = this.mapRef?.googleMap;
      if (!map) {
        requestAnimationFrame(waitForMap);
        return;
      }
      map.setOptions({
        draggableCursor: this.picking ? this.cursorTargetRed : undefined,
        draggingCursor: this.picking ? this.cursorTargetRed : undefined,
      });
      // Fuerza un primer fetch por si (mapIdle) no dispara al inicio
      setTimeout(() => this.onMapIdle(), 0);
    };
    waitForMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cambia cursor sin recrear
    if (changes['picking'] && this.mapRef?.googleMap) {
      this.mapRef.googleMap.setOptions({
        draggableCursor: this.picking ? this.cursorTargetRed : undefined,
        draggingCursor: this.picking ? this.cursorTargetRed : undefined,
      });
    }
    // Cuando cambian las cajas locales => recalcula local markers y fusiona
    if (changes['instantCajas']) {
      const list = this.instantCajas ?? [];
      this.local = list
        .map((c) => this.mapCajaToMarker(c))
        .filter(Boolean) as Marker[];
      this.rebuildMarkers();
    }
  }

  // ===== Helpers =====
  private initializeMap() {
    if (!this.isGoogleMapsLoaded) return;
    const center = new google.maps.LatLng(
      this.DEFAULT_CENTER.lat,
      this.DEFAULT_CENTER.lng
    );
    this.myposition.set(center);
    this.zoom.set(12);

    setTimeout(() => {
      this.mapRef?.googleMap?.setOptions({
        draggableCursor: this.picking ? this.cursorTargetRed : undefined,
        draggingCursor: this.picking ? this.cursorTargetRed : undefined,
      });
    });
  }

  private loadGoogleMapsIfNeeded(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google?.maps) {
        this.isGoogleMapsLoaded = true;
        resolve();
        return;
      }
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src*="maps.googleapis.com/maps/api/js"]'
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

  /** Convierte "lat,lng" a LatLngLiteral o null */
  get selectedLatLng(): LatLngLiteral | null {
    const s = this.selectedCoords?.trim();
    if (!s) return null;
    const [la, ln] = s.split(',').map((v) => v.trim());
    const lat = Number(la),
      lng = Number(ln);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  // ===== Eventos =====
  onMapClickHandler(ev: google.maps.MapMouseEvent) {
    if (!this.picking) return;
    const ll = ev?.latLng?.toJSON?.();
    if (ll && Number.isFinite(ll.lat) && Number.isFinite(ll.lng)) {
      this.mapClick.emit({ lat: ll.lat, lng: ll.lng });
    }
  }

  /** Fetch por viewport + debounce y fusión con locales */
  async onMapIdle() {
    const gmap = this.mapRef?.googleMap;
    if (!gmap) return;

    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(async () => {
      const bounds = gmap.getBounds();
      if (!bounds) return;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      const stamp = ++this.inFlight;
      try {
        const cajas = await this.cajasService.getCajasInBounds(
          { lat: ne.lat(), lng: ne.lng() },
          { lat: sw.lat(), lng: sw.lng() }
        );

        // Normaliza a markers remotos
        this.fetched = cajas
          .map((c) => this.mapCajaToMarker(c))
          .filter(Boolean) as Marker[];

        // Descarta si llegó otra respuesta más nueva
        if (stamp !== this.inFlight) return;

        this.rebuildMarkers();
      } catch (e) {
        console.error('Error cargando cajas:', e);
      }
    }, 200);
  }

  // ===== Fusión de marcadores =====
  private rebuildMarkers() {
    const map = new Map<number, Marker>();
    // primero locales (para verlas al toque)
    for (const m of this.local) map.set(m.id, m);
    // luego remotos (si coincide id, puede sobreescribir, o al revés si prefieres)
    for (const m of this.fetched) map.set(m.id, m);
    this.markers = Array.from(map.values());
  }

  private mapCajaToMarker(c: ICajas): Marker | null {
    let lat = c.lat != null ? Number(c.lat) : NaN;
    let lng = c.lng != null ? Number(c.lng) : NaN;

    if (
      (!Number.isFinite(lat) || !Number.isFinite(lng)) &&
      c.caja_coordenadas
    ) {
      const [la, ln] = c.caja_coordenadas
        .split(',')
        .map((s) => Number((s || '').trim()));
      lat = la;
      lng = ln;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return {
      id: c.id,
      position: { lat, lng },
      title: `${c.caja_nombre} • ${c.caja_estado}`,
      options: { icon: this.makeIcon(c) },
    };
  }

  private getAnchor(px: number) {
    // ancla centrada, un poco abajo
    return new google.maps.Point(px / 2, px * 0.94);
  }

  private getColorsByEstado(estado?: string): StateColor {
    const key = (estado || '').toUpperCase().trim();
    const def: StateColor = {
      fill: '#1e88e5',
      stroke: '#0a2540',
      text: '#ffffff',
    };
    return this.STATE_COLORS[key] ?? def;
  }

  private getShapeByTipo(tipo?: string): 'hex' | 'square' {
    const t = (tipo || '').toUpperCase().trim();
    return t === 'NAP' ? 'square' : 'hex'; // PON por defecto = hex
  }

  /** 'PON 0/3' -> '0/3' | 'NAP 0/1/3' -> '0/1/3' | fallback a primeras 4 letras */
  private getShortLabel(nombre: string = ''): string {
    const m = nombre.match(/(\d+\/\d+(?:\/\d+)?)/);
    if (m) return m[1].slice(0, 7);
    const t = nombre.split(/\s+/)[0]?.toUpperCase() || 'CX';
    return t.slice(0, 4);
  }

  /** SVG por tipo: HEX (PON) | SQUARE (NAP) + color por estado */
  private makeIcon(c: ICajas): google.maps.Icon {
    const label = this.getShortLabel(c.caja_nombre);
    const { fill, stroke, text } = this.getColorsByEstado(c.caja_estado);
    const textColor = text || '#ffffff';
    const shape = this.getShapeByTipo(c.caja_tipo);

    const key = [
      `EST:${(c.caja_estado || '').toUpperCase()}`,
      `SHAPE:${shape}`,
      `LBL:${label}`,
      fill,
      stroke,
      textColor,
      this.iconSizePx,
    ].join('|');

    const cached = this.iconCache.get(key);
    if (cached) return cached;

    const svgHex = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>
  <polygon points="24,6 36,14 36,28 24,36 12,28 12,14"
           fill="${fill}" stroke="${stroke}" stroke-width="2" filter="url(#shadow)"/>
  <text x="24" y="23" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700"
        text-anchor="middle" stroke="rgba(255,255,255,0.65)" stroke-width="2" paint-order="stroke"
        fill="${textColor}">${label}</text>
</svg>`.trim();

    const svgSquare = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>
  <rect x="12" y="10" width="24" height="24" rx="4" ry="4"
        fill="${fill}" stroke="${stroke}" stroke-width="2" filter="url(#shadow)"/>
  <text x="24" y="26" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700"
        text-anchor="middle" stroke="rgba(255,255,255,0.65)" stroke-width="2" paint-order="stroke"
        fill="${textColor}">${label}</text>
</svg>`.trim();

    const svg = shape === 'hex' ? svgHex : svgSquare;

    const url = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    const px = this.iconSizePx;
    const icon: google.maps.Icon = {
      url,
      scaledSize: new google.maps.Size(px, px),
      anchor: this.getAnchor(px),
    };
    this.iconCache.set(key, icon);
    return icon;
  }
}
