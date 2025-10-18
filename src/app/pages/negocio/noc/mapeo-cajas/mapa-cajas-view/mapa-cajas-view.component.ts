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
  OnDestroy,
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
  labelTop: string; // 👈 texto que mostraremos arriba
  options: google.maps.MarkerOptions; // icono (hex/square) sin texto
};

@Component({
  selector: 'app-mapa-cajas-view',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapMarker],
  templateUrl: './mapa-cajas-view.component.html',
  styleUrls: ['./mapa-cajas-view.component.css'],
})
export class MapaCajasViewComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  /** Modo selección (cursor mira y click para escoger coords) */
  @Input() picking = false;
  /** Coordenadas elegidas en formato "lat,lng" */
  @Input() selectedCoords: string | null = null;
  /** Cajas locales (recién creadas) para pintar INSTANTÁNEO */
  @Input() instantCajas: ICajas[] | null = null;
  /** Tamaño de iconos en px */
  // Tamaño “base” (se usa si no hay mapa o fuera de rango)
  @Input() iconSizePx = 32;

  // Mapa opcional: nivel de zoom → tamaño en px
  // Ejemplo: 12→20px, 14→25px, 16→30px
  @Input() iconSizeMap?: Record<number, number>;

  @Input() borderPx = 2; // grosor de borde visible en pantalla

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

  /** Marcadores finales (fusión de remotos + locales) */
  markers: Marker[] = [];
  private fetched: Marker[] = [];
  private local: Marker[] = [];

  /** Cache de iconos SVG ya generados */
  private iconCache = new Map<string, google.maps.Icon>();

  /** Overlays para etiquetas arriba del icono */
  private labelOverlays = new Map<number, google.maps.OverlayView>();

  /** Colores por ESTADO */
  private readonly STATE_COLORS: Record<string, StateColor> = {
    ACTIVO: { fill: '#16a34a', stroke: '#000000ff', text: '#000000ff' }, // verde
    DISEÑO: { fill: '#f3bb14ff', stroke: '#eeff00ff', text: '#000000ff' }, // amarillo
    MANTENIMIENTO: { fill: '#f97316', stroke: '#7c2d12', text: '#000000ff' }, // naranja
    FULL: { fill: '#ff0000ff', stroke: '#000000ff', text: '#000000ff' }, // gris
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

  private readonly VIEWBOX = 48;

  private calcStrokeSvg(iconScreenPx: number, borderScreenPx: number) {
    // stroke-width en unidades del viewBox
    return (borderScreenPx * this.VIEWBOX) / iconScreenPx;
  }

  // (opcional) Si quieres variar por tipo:
  private getBorderPxByTipo(c: ICajas): number {
    return (c.caja_tipo || '').toUpperCase() === 'PON' ? 3 : this.borderPx;
  }

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

      // Fuerza redibujo de overlays al cambiar zoom
      map.addListener('zoom_changed', () => {
        // Reposiciona overlays (draw se llama, pero así nos aseguramos)
        this.refreshLabelOverlays();
      });

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
    // Cajas locales => recalcula y fusiona
    if (changes['instantCajas']) {
      const list = this.instantCajas ?? [];
      this.local = list
        .map((c) => this.mapCajaToMarker(c))
        .filter(Boolean) as Marker[];
      this.rebuildMarkers();
    }
  }

  ngOnDestroy(): void {
    // Limpia overlays
    this.clearLabelOverlays();
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

  private makeIcon(c: ICajas): google.maps.Icon {
    const { fill: estFill, stroke } = this.getColorsByEstado(c.caja_estado);
    const shape = this.getShapeByTipo(c.caja_tipo);
    const px = this.iconSizePx;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    // PON con relleno blanco (si ya lo tienes así, mantenlo)
    const fill =
      (c.caja_tipo || '').toUpperCase() === 'PON' ? '#004ff8ff' : estFill;

    // 👇 grosor deseado en pantalla (puedes usar this.borderPx o la función por tipo)
    const borderScreenPx = this.getBorderPxByTipo(c); // o this.borderPx
    const strokeSvg = this.calcStrokeSvg(px, borderScreenPx);
    const strokeSvgStr = strokeSvg.toFixed(2);

    const key = [
      `TYPE:${(c.caja_tipo || '').toUpperCase()}`,
      `EST:${(c.caja_estado || '').toUpperCase()}`,
      `SHAPE:${shape}`,
      `SIZE:${px}`,
      `BORDER:${borderScreenPx}`, // 👈 entra al caché
      fill,
      stroke,
      dpr,
    ].join('|');

    const cached = this.iconCache.get(key);
    if (cached) return cached;

    const svgHex = `
<svg xmlns="http://www.w3.org/2000/svg" width="${px * dpr}" height="${
      px * dpr
    }" viewBox="0 0 48 48">
  <defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.35)"/></filter></defs>
  <polygon points="24,6 36,14 36,28 24,36 12,28 12,14"
           fill="${fill}" stroke="${stroke}" stroke-width="${strokeSvgStr}" filter="url(#shadow)"/>
</svg>`.trim();

    const svgSquare = `
<svg xmlns="http://www.w3.org/2000/svg" width="${px * dpr}" height="${
      px * dpr
    }" viewBox="0 0 48 48">
  <defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.35)"/></filter></defs>
  <rect x="12" y="10" width="24" height="24" rx="4" ry="4"
        fill="${fill}" stroke="${stroke}" stroke-width="${strokeSvgStr}" filter="url(#shadow)"/>
</svg>`.trim();

    const svg = shape === 'hex' ? svgHex : svgSquare;
    const url = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);

    const icon: google.maps.Icon = {
      url,
      size: new google.maps.Size(px * dpr, px * dpr),
      scaledSize: new google.maps.Size(px, px),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(px / 2, px * 0.94),
    };

    this.iconCache.set(key, icon);
    return icon;
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

        this.fetched = cajas
          .map((c) => this.mapCajaToMarker(c))
          .filter(Boolean) as Marker[];

        if (stamp !== this.inFlight) return;

        this.rebuildMarkers();
      } catch (e) {
        console.error('Error cargando cajas:', e);
      }
    }, 200);
  }

  // ===== Fusión de marcadores + etiquetas =====
  private rebuildMarkers() {
    const map = new Map<number, Marker>();
    for (const m of this.local) map.set(m.id, m); // locales primero
    for (const m of this.fetched) map.set(m.id, m); // luego remotos
    this.markers = Array.from(map.values());

    // (re)crear overlays de etiquetas
    this.refreshLabelOverlays();
  }

  // ====== Overlays (labels arriba) ======
  /** Borra todos los overlays */
  private clearLabelOverlays() {
    this.labelOverlays.forEach((ov) => ov.setMap(null as any));
    this.labelOverlays.clear();
  }

  /** Crea/actualiza overlays acorde a markers actuales */
  private refreshLabelOverlays() {
    const gmap = this.mapRef?.googleMap;
    if (!gmap) return;

    // Limpia todo y recrea (simple y robusto)
    this.clearLabelOverlays();

    const offsetPx = Math.max(10, this.iconSizePx / 2 + 14); // arriba del icono
    for (const m of this.markers) {
      const overlay = this.createNameOverlay(m.position, m.labelTop, offsetPx);
      overlay.setMap(gmap);
      this.labelOverlays.set(m.id, overlay);
    }
  }

  /** Crea un OverlayView que pinta un DIV con el nombre arriba del punto */
  private createNameOverlay(
    pos: google.maps.LatLngLiteral,
    text: string,
    offsetY: number
  ) {
    class NameOverlay extends google.maps.OverlayView {
      private div?: HTMLDivElement;
      private position: google.maps.LatLngLiteral = pos;
      private label: string = text;

      override onAdd(): void {
        this.div = document.createElement('div');
        this.div.textContent = this.label;

        // ✅ Estilos INLINE (no dependen del CSS del componente)
        Object.assign(this.div.style, {
          position: 'absolute',
          pointerEvents: 'none',
          background: 'rgba(255,255,255,0.95)',
          color: '#111',
          fontSize: '12px',
          lineHeight: '1.1',
          padding: '2px 6px',
          border: '1px solid rgba(0,0,0,0.25)',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 6px rgba(0,0,0,.15)',
          userSelect: 'none',
          zIndex: '200',
          transform: 'translate(-50%, -100%)',
        } as CSSStyleDeclaration);

        const panes = this.getPanes();
        // ✅ flotando por encima de marcadores
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
        if (this.div?.parentNode) this.div.parentNode.removeChild(this.div);
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
      labelTop: c.caja_nombre,
      options: {
        icon: this.makeIcon(c), // <- ya fija scaledSize en px
        optimized: false, // <- fuerza DOM, tamaño más consistente
        zIndex: 10,
      },
    };
  }
}
