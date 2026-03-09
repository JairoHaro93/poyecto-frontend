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
  labelTop: string;
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

  @Input() measureActive = false;
  @Input() measurePoints: google.maps.LatLngLiteral[] = [];

  // Mapa opcional: nivel de zoom → tamaño en px
  // Ejemplo: 12→20px, 14→25px, 16→30px
  @Input() iconSizeMap?: Record<number, number>;

  @Input() borderPx = 2; // grosor de borde visible en pantalla

  /** Emite lat/lng al click en modo picking */
  @Output() mapClick = new EventEmitter<{ lat: number; lng: number }>();

  // arriba con los otros @Output()
  @Output() markerClick = new EventEmitter<number>();

  onMarkerClick(id: number) {
    if (this.picking) return;

    // ✅ si mides distancia: usar la posición del marker como punto
    if (this.measureActive) {
      const m = this.markers.find((x) => x.id === id);
      if (m) this.mapClick.emit({ lat: m.position.lat, lng: m.position.lng });
      return;
    }

    this.markerClick.emit(id);
  }
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

  private readonly LABEL_FONT_SIZE_PX = 12;
  private readonly LABEL_PAD_Y_PX = 5;
  private readonly LABEL_PAD_X_PX = 10;
  private readonly LABEL_BORDER_PX = 2;
  private readonly LABEL_OFFSET_EXTRA_PX = 9;

  myposition = signal<any>(''); // center (google.maps.LatLng)
  zoom = signal<number>(12);

  // Centro por defecto (Latacunga aprox)
  private readonly DEFAULT_CENTER: LatLngLiteral = {
    lat: -0.9398,
    lng: -78.616569,
  };

  private measureLine?: google.maps.Polyline;
  private measurePointMarkers: google.maps.Marker[] = [];

  private ensureMeasureLine() {
    if (this.measureLine) return;

    this.measureLine = new google.maps.Polyline({
      geodesic: true,
      strokeOpacity: 0.95,
      strokeWeight: 3,
      // color tipo Google Maps (rojo)
      strokeColor: '#e50914',
      clickable: false,
    });
  }

  private clearMeasureMarkers() {
    for (const m of this.measurePointMarkers) m.setMap(null);
    this.measurePointMarkers = [];
  }

  private getLabelOffsetPx(iconPx: number): number {
    return Math.round(iconPx / 2 + this.LABEL_OFFSET_EXTRA_PX);
  }

  private updateMeasureGraphics() {
    const gmap = this.mapRef?.googleMap;
    if (!gmap) return;

    this.ensureMeasureLine();

    // si no está activo o no hay puntos -> oculta todo
    if (
      !this.measureActive ||
      !this.measurePoints ||
      this.measurePoints.length === 0
    ) {
      this.measureLine!.setMap(null);
      this.clearMeasureMarkers();
      return;
    }

    // mostrar línea
    this.measureLine!.setMap(gmap);
    this.measureLine!.setPath(this.measurePoints);

    // dibujar puntos (bolitas)
    const icon: google.maps.Symbol = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,
      fillColor: '#e50914',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    };

    // asegurar cantidad de markers = cantidad de puntos
    while (this.measurePointMarkers.length < this.measurePoints.length) {
      const mk = new google.maps.Marker({
        map: gmap,
        clickable: false,
        optimized: false,
        icon,
      });
      this.measurePointMarkers.push(mk);
    }
    while (this.measurePointMarkers.length > this.measurePoints.length) {
      const mk = this.measurePointMarkers.pop()!;
      mk.setMap(null);
    }

    // actualizar posiciones
    for (let i = 0; i < this.measurePoints.length; i++) {
      this.measurePointMarkers[i].setPosition(this.measurePoints[i]);
    }
  }

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
        draggableCursor:
          this.picking || this.measureActive ? this.cursorTargetRed : undefined,
        draggingCursor:
          this.picking || this.measureActive ? this.cursorTargetRed : undefined,
      });

      // Fuerza redibujo de overlays al cambiar zoom
      map.addListener('zoom_changed', () => {
        // Reposiciona overlays (draw se llama, pero así nos aseguramos)
        this.refreshLabelOverlays();
      });

      this.updateMeasureGraphics();
      this.updateMeasureGraphics();
      setTimeout(() => this.onMapIdle(), 0);
    };
    waitForMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cambia cursor sin recrear
    if (
      (changes['picking'] || changes['measureActive']) &&
      this.mapRef?.googleMap
    ) {
      this.mapRef.googleMap.setOptions({
        draggableCursor:
          this.picking || this.measureActive ? this.cursorTargetRed : undefined,
        draggingCursor:
          this.picking || this.measureActive ? this.cursorTargetRed : undefined,
      });
    }

    if (changes['measureActive'] || changes['measurePoints']) {
      // si el mapa ya existe, repinta línea/puntos
      this.updateMeasureGraphics();
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
    this.clearLabelOverlays();

    this.measureLine?.setMap(null as any);
    this.clearMeasureMarkers();
  }

  // ===== Helpers =====
  private initializeMap() {
    if (!this.isGoogleMapsLoaded) return;
    const center = new google.maps.LatLng(
      this.DEFAULT_CENTER.lat,
      this.DEFAULT_CENTER.lng,
    );
    this.myposition.set(center);
    this.zoom.set(12);

    setTimeout(() => {
      this.mapRef?.googleMap?.setOptions({
        draggableCursor:
          this.picking || this.measureActive ? this.cursorTargetRed : undefined,
        draggingCursor:
          this.picking || this.measureActive ? this.cursorTargetRed : undefined,
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
    // ✅ viene del backend (getCajas ya trae full/disponibles)
    const isFull =
      (c as any).full === true || Number((c as any).disponibles ?? 999999) <= 0;

    const tipo = (c.caja_tipo || '').toUpperCase().trim();

    const { fill: estFill, stroke } = this.getColorsByEstado(c.caja_estado);
    const shape = this.getShapeByTipo(c.caja_tipo);
    const px = this.iconSizePx;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    // ====== RELLENO SEGÚN REGLAS ======
    let fill = estFill;

    if (tipo === 'PON') {
      fill = isFull ? '#f97316' : '#004ff8ff'; // PON full -> naranja; normal -> azul
    } else if (tipo === 'NAP') {
      fill = isFull ? '#ff0000ff' : estFill; // NAP full -> rojo
    }

    // ====== BORDE / GROSOR ======
    const borderScreenPx = this.getBorderPxByTipo(c);
    const strokeSvg = this.calcStrokeSvg(px, borderScreenPx);
    const strokeSvgStr = strokeSvg.toFixed(2);

    // ✅ mejora performance: NO uses ID en el cache key
    const key = [
      `TYPE:${tipo}`,
      `FULL:${isFull ? 1 : 0}`,
      `EST:${(c.caja_estado || '').toUpperCase().trim()}`,
      `SHAPE:${shape}`,
      `SIZE:${px}`,
      `BORDER:${borderScreenPx}`,
      `FILL:${fill}`,
      `STROKE:${stroke}`,
      `DPR:${dpr}`,
    ].join('|');

    const cached = this.iconCache.get(key);
    if (cached) return cached;

    const svgHex = `
<svg xmlns="http://www.w3.org/2000/svg" width="${px * dpr}" height="${px * dpr}" viewBox="0 0 48 48">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>
  <polygon points="24,6 36,14 36,28 24,36 12,28 12,14"
           fill="${fill}" stroke="${stroke}" stroke-width="${strokeSvgStr}" filter="url(#shadow)"/>
</svg>`.trim();

    const svgSquare = `
<svg xmlns="http://www.w3.org/2000/svg" width="${px * dpr}" height="${px * dpr}" viewBox="0 0 48 48">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>
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
    // ✅ permitir click si picking O measureActive
    if (!this.picking && !this.measureActive) return;

    const ll = ev?.latLng?.toJSON?.();
    if (ll && Number.isFinite(ll.lat) && Number.isFinite(ll.lng)) {
      this.mapClick.emit({ lat: ll.lat, lng: ll.lng });
    }
  }

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
          { lat: sw.lat(), lng: sw.lng() },
        );

        if (stamp !== this.inFlight) return;

        // (opcional) limpia caché para que el icono cambie si cambian "full/estado"
        this.iconCache.clear();

        // Construye marcadores directamente (ya viene full/disponibles en cada caja)
        this.fetched = cajas
          .map((c) => this.mapCajaToMarker(c))
          .filter(Boolean) as Marker[];

        this.rebuildMarkers();
      } catch (e) {
        console.error('Error cargando cajas:', e);
      }
    }, 200);
  }
  // ===== Fusión de marcadores + etiquetas =====
  private rebuildMarkers() {
    const map = new Map<number, Marker>();
    for (const m of this.local) map.set(m.id, m);
    for (const m of this.fetched) map.set(m.id, m);
    this.markers = Array.from(map.values());

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

    this.clearLabelOverlays();

    const offsetPx = this.getLabelOffsetPx(this.iconSizePx);

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
        icon: this.makeIcon(c),
        optimized: false,
        zIndex: 10,
      },
    };
  }
}
