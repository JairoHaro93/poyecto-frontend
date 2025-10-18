import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaCajasControlsComponent } from './mapa-cajas-controls/mapa-cajas-controls.component';
import { MapaCajasViewComponent } from './mapa-cajas-view/mapa-cajas-view.component';
import { ICajas } from '../../../../interfaces/negocio/infraestructura/icajas.interface';

type ModalType = 'caja' | null;

@Component({
  selector: 'app-mapeo-cajas',
  standalone: true,
  imports: [CommonModule, MapaCajasControlsComponent, MapaCajasViewComponent],
  templateUrl: './mapeo-cajas.component.html',
  styleUrls: ['./mapeo-cajas.component.css'],
})
export class MapeoCajasComponent {
  activeModal = signal<ModalType>(null);
  picking = signal<boolean>(false);
  pickedCoords = signal<string | null>(null);

  // listado visible en el mapa (puedes llenarlo al iniciar con un fetch)
  cajas: ICajas[] = [];

  iconSizeMap: Record<number, number> = {
    12: 20,
    14: 25,
    16: 30,
    18: 42,
    20: 56,
  };

  openCrearCaja() {
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
    // Añade la caja creada al arreglo para dibujar el marcador
    this.cajas = [
      ...this.cajas,
      {
        ...caja,
        // si backend no devolvió caja_coordenadas pero el form la envió, ya viene en 'caja'
      },
    ];
    this.closeModal();
  }
}
