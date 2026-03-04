import { Component, OnInit, signal } from '@angular/core';
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

@Component({
  selector: 'app-mapeo-cajas',
  standalone: true,
  imports: [CommonModule, MapaCajasControlsComponent, MapaCajasViewComponent],
  templateUrl: './mapeo-cajas.component.html',
  styleUrls: ['./mapeo-cajas.component.css'],
})
export class MapeoCajasComponent implements OnInit {
  constructor(private cajasService: CajasService) {}

  // ===== Overlay crear caja =====
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

  async ngOnInit(): Promise<void> {
    // carga inicial (opcional pero recomendado)
    try {
      this.cajas = await this.cajasService.getCajas({ limit: 2000 });
    } catch (e) {
      console.error('Error cargando cajas iniciales:', e);
      this.cajas = [];
    }
  }

  openCrearCaja() {
    this.closeDetails(); // 👈 agrega esto
    this.activeModal.set('caja');
  }

  closeModal() {
    this.activeModal.set(null);
    this.picking.set(false);
    this.pickedCoords.set(null);
  }

  startPickingFromMap() {
    this.pickedCoords.set(null);
    this.picking.set(true);
  }

  onMapClick(coords: { lat: number; lng: number }) {
    if (!this.picking()) return;
    const lat = coords.lat.toFixed(6);
    const lng = coords.lng.toFixed(6);
    this.pickedCoords.set(`${lat},${lng}`);
    this.picking.set(false);
  }

  onCajaCreated(caja: ICajas) {
    // añade la caja creada al arreglo para dibujar el marcador
    this.cajas = [...this.cajas, { ...caja }];
    this.closeModal();
  }

  // ===== Panel detalle (click marker) =====
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
    this.detailsOpen.set(true);
    this.detailsLoading.set(true);
    this.selectedCaja.set(null);
    this.selectedDisp.set(null);
    this.selectedRutas.set(null);

    const stamp = ++this.reqStamp;

    try {
      const caja = await this.cajasService.getCajaById(id);
      if (stamp !== this.reqStamp) return;
      this.selectedCaja.set(caja);

      const dispRes = await this.cajasService.getDisponibilidad(id);
      if (stamp !== this.reqStamp) return;
      this.selectedDisp.set(dispRes.data);

      const tipo = String(caja.caja_tipo || '')
        .toUpperCase()
        .trim();
      if (tipo === 'PON') {
        const rutasRes = await this.cajasService.getRutasDisponibles(id);
        if (stamp !== this.reqStamp) return;
        this.selectedRutas.set(rutasRes.data?.disponibles ?? []);
      }
    } catch (e) {
      console.error('Error cargando detalle caja:', e);
    } finally {
      if (stamp === this.reqStamp) this.detailsLoading.set(false);
    }
  }
}
