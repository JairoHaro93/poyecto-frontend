import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaCajasControlsComponent } from './mapa-cajas-controls/mapa-cajas-controls.component';
import { MapaCajasViewComponent } from './mapa-cajas-view/mapa-cajas-view.component';
import { ICajas } from '../../../../interfaces/negocio/infraestructura/icajas.interface';
import { CajasService } from '../../../../services/negocio_latacunga/cajas.services';

type ModalType = 'caja' | null;
type Disp = {
  caja_id: number;
  tipo: string;
  capacidad: number;
  usados: number;
  disponibles: number;
};

type LatLng = { lat: number; lng: number };

@Component({
  selector: 'app-mapeo-cajas',
  standalone: true,
  imports: [CommonModule, MapaCajasControlsComponent, MapaCajasViewComponent],
  templateUrl: './mapeo-cajas.component.html',
  styleUrls: ['./mapeo-cajas.component.css'],
})
export class MapeoCajasComponent {
  constructor(private cajasService: CajasService) {}

  activeModal = signal<ModalType>(null);
  picking = signal<boolean>(false);
  pickedCoords = signal<string | null>(null);

  // listado visible en el mapa
  cajas: ICajas[] = [];

  iconSizeMap: Record<number, number> = {
    12: 20,
    14: 25,
    16: 30,
    18: 42,
    20: 56,
  };

  // ======= DETALLES (ya lo tenías) =======
  detailsOpen = signal(false);
  detailsLoading = signal(false);
  selectedCaja = signal<ICajas | null>(null);
  selectedDisp = signal<Disp | null>(null);
  selectedRutas = signal<string[] | null>(null);
  private reqStamp = 0;

  closeDetails() {
    this.detailsOpen.set(false);
    this.selectedCaja.set(null);
    this.selectedDisp.set(null);
    this.selectedRutas.set(null);
  }

  async onMarkerSelected(id: number) {
    // si estás midiendo distancia, NO abrir detalles
    if (this.measuring()) return;

    this.detailsOpen.set(true);
    this.detailsLoading.set(true);
    this.selectedRutas.set(null);

    const stamp = ++this.reqStamp;

    try {
      const caja = await this.cajasService.getCajaById(id);
      if (stamp !== this.reqStamp) return;
      this.selectedCaja.set(caja);

      const dispRes = await this.cajasService.getDisponibilidad(id);
      if (stamp !== this.reqStamp) return;
      this.selectedDisp.set(dispRes.data);

      if (String(caja.caja_tipo || '').toUpperCase() === 'PON') {
        const rutasRes = await this.cajasService.getRutasDisponibles(id);
        if (stamp !== this.reqStamp) return;
        this.selectedRutas.set(rutasRes.data?.disponibles ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (stamp === this.reqStamp) this.detailsLoading.set(false);
    }
  }

  // ======= MODAL CREAR CAJA (ya lo tenías) =======
  openCrearCaja() {
    // si estabas midiendo, sal
    this.stopMeasuring();
    this.activeModal.set('caja');
  }

  closeModal() {
    this.activeModal.set(null);
    this.picking.set(false);
    this.pickedCoords.set(null);
  }

  startPickingFromMap() {
    // si estabas midiendo, sal
    this.stopMeasuring();
    this.closeDetails();
    this.pickedCoords.set(null);
    this.picking.set(true);
  }

  onCajaCreated(caja: ICajas) {
    this.cajas = [...this.cajas, { ...caja }];
    this.closeModal();
  }

  // ======= DISTANCIA (NUEVO) =======
  measuring = signal<boolean>(false);
  measurePoints = signal<LatLng[]>([]);

  distanceMeters = computed(() => {
    const pts = this.measurePoints();
    if (pts.length < 2) return 0;
    let sum = 0;
    for (let i = 1; i < pts.length; i++)
      sum += this.haversineMeters(pts[i - 1], pts[i]);
    return sum;
  });

  distanceLabel = computed(() => `${Math.round(this.distanceMeters())} m`);

  toggleMeasuring() {
    if (this.measuring()) this.stopMeasuring();
    else this.startMeasuring();
  }

  startMeasuring() {
    this.closeModal();
    this.picking.set(false);
    this.closeDetails();
    this.measuring.set(true);
    this.measurePoints.set([]);
  }

  stopMeasuring() {
    this.measuring.set(false);
    // no borro puntos automáticamente por si quieres ver el resultado aún
  }

  clearMeasure() {
    this.measurePoints.set([]);
  }

  undoMeasure() {
    const arr = this.measurePoints();
    if (!arr.length) return;
    this.measurePoints.set(arr.slice(0, -1));
  }

  // ======= CLICK MAPA (unificado) =======
  onMapClick(coords: { lat: number; lng: number }) {
    // 1) si estás midiendo, agrega punto
    if (this.measuring()) {
      const lat = Number(coords.lat.toFixed(6));
      const lng = Number(coords.lng.toFixed(6));
      this.measurePoints.set([...this.measurePoints(), { lat, lng }]);
      return;
    }

    // 2) si estás eligiendo coords para crear caja
    if (!this.picking()) return;
    const lat = coords.lat.toFixed(6);
    const lng = coords.lng.toFixed(6);
    this.pickedCoords.set(`${lat},${lng}`);
    this.picking.set(false);
  }

  // Haversine (metros) sin librería geometry
  private haversineMeters(a: LatLng, b: LatLng) {
    const R = 6371000; // m
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
