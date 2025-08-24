import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Modal } from 'bootstrap';
import { ImagenesService } from '../../../../services/negocio_latacunga/imagenes.service';
import { of, from } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';

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
  private imagenesService = inject(ImagenesService);

  // ===== Buscador (server-side, mínimo 2 letras) =====
  queryCtrl = new FormControl<string>('', { nonNullable: true });
  sugerencias: ClienteSugerencia[] = [];
  showSugerencias = false;
  highlightedIndex = -1;

  // Campos del formulario
  busqueda: string = ''; // nombre (lo seguimos usando para mostrar/llenar)
  busquedaCedula: string = ''; // cédula

  // Datos completos del cliente y sus servicios
  clienteSeleccionado: any = null;
  servicioSeleccionado: any = null;
  imagenSeleccionada: string | null = null;

  imagenesInstalacion: { [key: string]: { ruta: string; url: string } } = {};
  // ✅ Suavizado de render (NUEVO)
  isReady = false;

  async ngOnInit() {
    // 🔎 Búsqueda reactiva: limpia si <2, consulta si >=2
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
    this.isReady = true; // ⬅️ muestra el contenido
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

  // === Búsqueda directa por cédula (se mantiene) ===
  async buscarClientePorCedula() {
    const cedulaBuscada = this.busquedaCedula.trim();
    if (!cedulaBuscada) return;
    await this.cargarDetalleClientePorCedula();
  }

  // Carga el detalle completo del cliente por su cédula (se mantiene y mejora)
  async cargarDetalleClientePorCedula() {
    const cedula = this.busquedaCedula.trim();
    if (!cedula) return;

    try {
      const detalle = await this.clienteService.getInfoClientesArray(cedula);
      if (detalle.servicios && detalle.servicios.length > 0) {
        this.clienteSeleccionado = detalle;
        this.servicioSeleccionado = detalle.servicios[0];

        // Autollenar nombre en input y variable de apoyo
        this.busqueda = detalle.nombre_completo;
        this.queryCtrl.setValue(detalle.nombre_completo, { emitEvent: false });

        // Mantener imágenes de instalación (igual que antes)
        this.cargarImagenesInstalacion(
          'neg_t_instalaciones',
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

  // === Imágenes (se mantiene igual) ===
  abrirImagenModal(url: string) {
    this.imagenSeleccionada = url;
    const modal = new Modal(document.getElementById('modalImagenAmpliada')!);
    modal.show();
  }

  private cargarImagenesInstalacion(tabla: string, ord_Ins: string): void {
    this.imagenesService.getImagenesByTableAndId(tabla, ord_Ins).subscribe({
      next: (res: any) => {
        if (res?.imagenes) {
          this.imagenesInstalacion = res.imagenes;
        } else {
          this.imagenesInstalacion = {};
        }
      },
      error: (err) => {
        console.error('❌ Error cargando imágenes:', err);
        this.imagenesInstalacion = {};
      },
    });
  }

  onServicioSeleccionado() {
    if (this.servicioSeleccionado?.orden_instalacion) {
      this.cargarImagenesInstalacion(
        'neg_t_instalaciones',
        this.servicioSeleccionado.orden_instalacion
      );
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
}
