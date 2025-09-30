import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Modal } from 'bootstrap';
import { of, from } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { ImagesService } from '../../../../services/negocio_latacunga/images.service';
import { ImageItem } from '../../../../interfaces/negocio/images/images';
import { environment } from '../../../../../environments/environment';

interface ClienteSugerencia {
  cedula: string;
  nombre_completo: string;
}

@Component({
  selector: 'app-datosclientes',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './datosclientes.component.html',
  styleUrls: ['./datosclientes.component.css'],
})
export class DatosclientesComponent {
  private clienteService = inject(ClientesService);
  private imagesService = inject(ImagesService);

  // ===== Buscador (server-side, mínimo 2 letras) =====
  queryCtrl = new FormControl<string>('', { nonNullable: true });
  sugerencias: ClienteSugerencia[] = [];
  showSugerencias = false;
  highlightedIndex = -1;

  // Campos del formulario
  busqueda: string = '';
  busquedaCedula: string = '';

  // Datos completos del cliente y sus servicios
  clienteSeleccionado: any = null;
  servicioSeleccionado: any = null;
  imagenSeleccionada: string | null = null;

  // Solo instalación
  imagenesInstalacion: { [key: string]: { ruta: string; url: string } } = {};

  isReady = false;

  async ngOnInit() {
    this.queryCtrl.valueChanges
      .pipe(
        map((v) => (v ?? '').trim()),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((v) => {
          if (v.length < 2) {
            this.clearClienteRelacionado();
            this.sugerencias = [];
            this.showSugerencias = false;
            this.highlightedIndex = -1;
            return of([] as ClienteSugerencia[]);
          }
          return from(this.clienteService.buscarClientes(v, 8)).pipe(
            catchError(() => of([] as ClienteSugerencia[]))
          );
        })
      )
      .subscribe((list) => {
        this.sugerencias = list;
        this.showSugerencias = list.length > 0;
        this.highlightedIndex = list.length ? 0 : -1;
      });

    this.isReady = true;
  }

  // === Selección / navegación de sugerencias ===
  async seleccionarSugerencia(c: ClienteSugerencia) {
    this.queryCtrl.setValue(c.nombre_completo, { emitEvent: false });
    this.busqueda = c.nombre_completo;
    this.busquedaCedula = c.cedula;
    this.sugerencias = [];
    this.showSugerencias = false;
    this.highlightedIndex = -1;
    await this.cargarDetalleClientePorCedula();
  }

  onNombreKeydown(event: KeyboardEvent) {
    if (!this.showSugerencias || this.sugerencias.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        this.highlightedIndex =
          (this.highlightedIndex + 1) % this.sugerencias.length;
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.highlightedIndex =
          (this.highlightedIndex + this.sugerencias.length - 1) %
          this.sugerencias.length;
        event.preventDefault();
        break;
      case 'Enter':
        if (this.highlightedIndex >= 0) {
          this.seleccionarSugerencia(this.sugerencias[this.highlightedIndex]);
          event.preventDefault();
        }
        break;
      case 'Escape':
        this.showSugerencias = false;
        this.highlightedIndex = -1;
        event.preventDefault();
        break;
    }
  }

  onNombreBlur() {
    setTimeout(() => (this.showSugerencias = false), 150);
  }
  onNombreFocus() {
    const v = (this.queryCtrl.value ?? '').trim();
    if (v.length >= 2 && this.sugerencias.length > 0)
      this.showSugerencias = true;
  }

  // === Búsqueda directa por cédula ===
  async buscarClientePorCedula() {
    const cedulaBuscada = this.busquedaCedula.trim();
    if (!cedulaBuscada) return;
    await this.cargarDetalleClientePorCedula();
  }

  // === Detalle del cliente ===
  async cargarDetalleClientePorCedula() {
    const cedula = this.busquedaCedula.trim();
    if (!cedula) return;

    try {
      const detalle = await this.clienteService.getInfoClientesArray(cedula);
      if (detalle.servicios && detalle.servicios.length > 0) {
        this.clienteSeleccionado = detalle;
        this.servicioSeleccionado = detalle.servicios[0];

        this.busqueda = detalle.nombre_completo;
        this.queryCtrl.setValue(detalle.nombre_completo, { emitEvent: false });

        // SOLO instalación (nuevo backend)
        this.cargarImagenesInstalacion(
          this.servicioSeleccionado?.orden_instalacion
        );
      } else {
        this.clienteSeleccionado = null;
        this.servicioSeleccionado = null;
        this.imagenesInstalacion = {};
      }
    } catch (error) {
      console.error('❌ Error al cargar detalle del cliente:', error);
    }
  }

  // === Modal imagen ===
  abrirImagenModal(url: string) {
    this.imagenSeleccionada = url;
    const modal = new Modal(document.getElementById('modalImagenAmpliada')!);
    modal.show();
  }

  // === Instalación -> nuevo backend (module='instalaciones') ===
  private cargarImagenesInstalacion(ordIns: string): void {
    if (!ordIns) return;

    console.debug('[INST] fetch ordIns ->', ordIns);

    this.imagesService.list('instalaciones', ordIns).subscribe({
      next: (items) => {
        this.imagenesInstalacion = this.adaptInstToLegacyMap(items);
        console.debug(
          '[INST] mapped keys ->',
          Object.keys(this.imagenesInstalacion)
        );
      },
      error: (err) => {
        console.error('❌ Error cargando imágenes (instalación):', err);
        this.imagenesInstalacion = {};
      },
    });
  }

  // Convierte ImageItem[] => { [clave]: { url, ruta } }
  // clave = tag o tag_position si trae position > 0
  private adaptInstToLegacyMap(
    items: ImageItem[]
  ): Record<string, { url: string; ruta: string }> {
    const map: Record<string, { url: string; ruta: string }> = {};
    for (const it of items ?? []) {
      const base = (it.tag || 'otros').trim();
      const key =
        typeof it.position === 'number' && it.position > 0
          ? `${base}_${it.position}`
          : base;

      const rel = (it as any).ruta_relativa as string | undefined;
      const url =
        it.url ??
        (rel
          ? `${environment.API_URL.replace(/\/api$/, '')}/imagenes/${rel}`
          : '');
      if (!url) continue;

      map[key] = { url, ruta: url };
    }
    return map;
  }

  onServicioSeleccionado() {
    const ordIns = this.servicioSeleccionado?.orden_instalacion;
    if (ordIns) {
      this.cargarImagenesInstalacion(ordIns);
    }
  }

  // === Utilidades ===
  private clearClienteRelacionado() {
    this.busqueda = '';
    this.busquedaCedula = '';
    this.clienteSeleccionado = null;
    this.servicioSeleccionado = null;
    this.imagenesInstalacion = {};
    this.imagenSeleccionada = null;
  }

  formatIpUrl(ip?: string): string {
    if (!ip) return '#';
    const clean = ip.trim();
    return /^https?:\/\//i.test(clean) ? clean : `http://${clean}`;
  }
}
