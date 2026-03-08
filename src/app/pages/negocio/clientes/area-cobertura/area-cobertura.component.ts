import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { environment } from '../../../../../environments/environment';
import { CajasService } from '../../../../services/negocio_latacunga/cajas.services';
import { ICajas } from '../../../../interfaces/negocio/infraestructura/icajas.interface';

type LatLngLiteral = google.maps.LatLngLiteral;

type CajaNap = ICajas & {
  full?: boolean;
  disponibles?: number;
  lat?: number | string | null;
  lng?: number | string | null;
};

type MarkerVm = {
  id: number;
  position: LatLngLiteral;
  title: string;
  options: google.maps.MarkerOptions;
};

@Component({
  selector: 'app-area-cobertura',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapMarker],
  templateUrl: './area-cobertura.component.html',
  styleUrl: './area-cobertura.component.css',
})
export class AreaCoberturaComponent implements OnInit, AfterViewInit {
  constructor(private cajasService: CajasService) {}

  @ViewChild(GoogleMap) mapRef!: GoogleMap;

  isGoogleMapsLoaded = false;
  isReady = false;
  cargando = false;

  myposition = signal<google.maps.LatLng | null>(null);
  zoom = signal<number>(13);

  readonly DEFAULT_CENTER: LatLngLiteral = {
    lat: -0.9398,
    lng: -78.616569,
  };

  markers: MarkerVm[] = [];
  private iconCache = new Map<string, google.maps.Icon>();

  // ===== DISTANCIA =====
  measuring = signal<boolean>(false);
  measurePoints = signal<LatLngLiteral[]>([]);

  distanceMeters = computed(() => {
    const pts = this.measurePoints();
    if (pts.length < 2) return 0;

    let sum = 0;
    for (let i = 1; i < pts.length; i++) {
      sum += this.haversineMeters(pts[i - 1], pts[i]);
    }
    return sum;
  });

  distanceLabel = computed(() => {
    const m = this.distanceMeters();
    if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
    return `${Math.round(m)} m`;
  });

  toggleMeasuring() {
    if (this.measuring()) this.stopMeasuring();
    else this.startMeasuring();
  }

  startMeasuring() {
    this.measuring.set(true);
    this.measurePoints.set([]);
    this.applyCursor();
    this.updateMeasureGraphics();
  }

  stopMeasuring() {
    this.measuring.set(false);
    this.applyCursor();
    this.updateMeasureGraphics();
  }

  clearMeasure() {
    this.measurePoints.set([]);
    this.updateMeasureGraphics();
  }

  undoMeasure() {
    const arr = this.measurePoints();
    if (!arr.length) return;
    this.measurePoints.set(arr.slice(0, -1));
    this.updateMeasureGraphics();
  }

  // =====  PUNTERO =====
  private readonly cursorTargetRed =
    "url('data:image/svg+xml;utf8," +
    '<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 32 32%22>' +
    '<circle cx=%2216%22 cy=%2216%22 r=%224%22 fill=%22%23e50914%22/>' +
    '<circle cx=%2216%22 cy=%2216%22 r=%229%22 fill=%22none%22 stroke=%22%23e50914%22 stroke-width=%222%22/>' +
    '<path d=%22M16 1v6M16 25v6M1 16h6M25 16h6%22 stroke=%22%23e50914%22 stroke-width=%222%22/>' +
    "</svg>') 16 16, crosshair";

  // ===== LÍNEA / PUNTOS =====
  private measureLine?: google.maps.Polyline;
  private measurePointMarkers: google.maps.Marker[] = [];

  private ensureMeasureLine() {
    if (this.measureLine) return;

    this.measureLine = new google.maps.Polyline({
      geodesic: true,
      strokeOpacity: 0.95,
      strokeWeight: 3,
      strokeColor: '#e50914',
      clickable: false,
    });
  }

  private clearMeasureMarkers() {
    for (const m of this.measurePointMarkers) m.setMap(null);
    this.measurePointMarkers = [];
  }

  private updateMeasureGraphics() {
    const gmap = this.mapRef?.googleMap;
    if (!gmap) return;

    this.ensureMeasureLine();

    const pts = this.measurePoints();

    if (!this.measuring() || !pts.length) {
      this.measureLine!.setMap(null);
      this.clearMeasureMarkers();
      return;
    }

    this.measureLine!.setMap(gmap);
    this.measureLine!.setPath(pts);

    const icon: google.maps.Symbol = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,
      fillColor: '#e50914',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    };

    while (this.measurePointMarkers.length < pts.length) {
      this.measurePointMarkers.push(
        new google.maps.Marker({
          map: gmap,
          clickable: false,
          optimized: false,
          icon,
        }),
      );
    }

    while (this.measurePointMarkers.length > pts.length) {
      const mk = this.measurePointMarkers.pop()!;
      mk.setMap(null);
    }

    for (let i = 0; i < pts.length; i++) {
      this.measurePointMarkers[i].setPosition(pts[i]);
    }
  }

  // ===== CICLO =====
  async ngOnInit() {
    try {
      this.isReady = false;
      await this.loadGoogleMapsIfNeeded();
      this.initializeMap();

      // ✅ CARGA ÚNICA
      await this.loadNapDisponibles();

      this.isReady = true;
    } catch (e) {
      console.error('Error iniciando AreaCobertura:', e);
      this.isReady = true;
    }
  }

  ngAfterViewInit() {
    const wait = () => {
      const gmap = this.mapRef?.googleMap;
      if (!gmap) {
        requestAnimationFrame(wait);
        return;
      }

      gmap.setOptions({
        mapTypeId: 'satellite',
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        draggableCursor: this.measuring() ? this.cursorTargetRed : undefined,
        draggingCursor: this.measuring() ? this.cursorTargetRed : undefined,
      });

      this.applyCursor();
      this.updateMeasureGraphics();
    };

    wait();
  }

  private initializeMap() {
    const center = new google.maps.LatLng(
      this.DEFAULT_CENTER.lat,
      this.DEFAULT_CENTER.lng,
    );
    this.myposition.set(center);
    this.zoom.set(13);
  }

  private applyCursor() {
    const gmap = this.mapRef?.googleMap;
    if (!gmap) return;

    gmap.setOptions({
      draggableCursor: this.measuring() ? this.cursorTargetRed : undefined,
      draggingCursor: this.measuring() ? this.cursorTargetRed : undefined,
    });
  }

  onMapClick(ev: google.maps.MapMouseEvent) {
    if (!this.measuring()) return;

    const ll = ev?.latLng?.toJSON?.();
    if (ll && Number.isFinite(ll.lat) && Number.isFinite(ll.lng)) {
      const lat = Number(ll.lat.toFixed(6));
      const lng = Number(ll.lng.toFixed(6));
      this.measurePoints.set([...this.measurePoints(), { lat, lng }]);
      this.updateMeasureGraphics();
    }
  }

  onMarkerClick(m: MarkerVm) {
    if (!this.measuring()) return;

    const lat = Number(m.position.lat.toFixed(6));
    const lng = Number(m.position.lng.toFixed(6));
    this.measurePoints.set([...this.measurePoints(), { lat, lng }]);
    this.updateMeasureGraphics();
  }

  // ===== CARGA ÚNICA DE NAP DISPONIBLES =====
  private async loadNapDisponibles() {
    this.cargando = true;

    try {
      const cajas = await this.cajasService.getCajas({
        tipo: 'NAP',
        limit: 5000,
      });

      const napes = (cajas as CajaNap[]).filter((c) => {
        const tipo = String(c.caja_tipo || '').toUpperCase();
        const full = (c as any).full === true;
        const disp = Number((c as any).disponibles ?? 0);

        return tipo === 'NAP' && !full && disp > 0;
      });

      this.iconCache.clear();

      this.markers = napes
        .map((c) => this.mapCajaToMarker(c))
        .filter(Boolean) as MarkerVm[];

      if (this.markers.length > 0) {
        const first = this.markers[0].position;
        this.myposition.set(new google.maps.LatLng(first.lat, first.lng));
        this.zoom.set(13);
      } else {
        this.myposition.set(
          new google.maps.LatLng(
            this.DEFAULT_CENTER.lat,
            this.DEFAULT_CENTER.lng,
          ),
        );
        this.zoom.set(13);
      }
    } catch (e) {
      console.error('Error cargando NAP disponibles:', e);
      this.markers = [];
    } finally {
      this.cargando = false;
    }
  }

  private mapCajaToMarker(c: CajaNap): MarkerVm | null {
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

    const disp = Number((c as any).disponibles ?? 0);

    return {
      id: c.id,
      position: { lat, lng },
      title: `${c.caja_nombre} • Disp: ${disp}`,
      options: {
        icon: this.makeNapIcon(disp),
        optimized: false,
        zIndex: 10,
      },
    };
  }

  private makeNapIcon(disponibles: number): google.maps.Icon {
    const px = 30;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const fill = '#16a34a';
    const stroke = '#0b3b16';

    const key = `NAP|${px}|${fill}|${stroke}|${dpr}`;
    const cached = this.iconCache.get(key);
    if (cached) return cached;

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${px * dpr}" height="${px * dpr}" viewBox="0 0 48 48">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>
  <rect x="12" y="10" width="24" height="24" rx="4" ry="4"
        fill="${fill}" stroke="${stroke}" stroke-width="2.6" filter="url(#shadow)"/>
</svg>`.trim();

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

  // ===== GOOGLE MAPS LOADER =====
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

  // ===== HAVERSINE =====
  private haversineMeters(a: LatLngLiteral, b: LatLngLiteral) {
    const R = 6371000;
    const toRad = (x: number) => (x * Math.PI) / 180;

    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
}
