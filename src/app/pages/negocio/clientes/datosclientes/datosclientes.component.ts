import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { of, from } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { Modal } from 'bootstrap';

import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { ImagesService } from '../../../../services/negocio_latacunga/images.service';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';

import { ImageItem } from '../../../../interfaces/negocio/images/images';
import { IVisConImagenes } from '../../../../interfaces/negocio/imagenes/imagenes.interface';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { environment } from '../../../../../environments/environment';

interface ClienteSugerencia {
  cedula: string;
  nombre_completo: string;
}

// Amplía Isoportes con los campos que devuelve el JOIN (para evitar errores en la plantilla)
type SoporteView = Isoportes & {
  reg_sop_registrado_por_nombre?: string;
  reg_sop_registrado_por_usuario?: string;
  reg_sop_noc_acepta_nombre?: string;
  reg_sop_noc_acepta_usuario?: string;
};

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
  private soportesService = inject(SoportesService);

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

  // Imágenes de instalación (legacy map)
  imagenesInstalacion: { [key: string]: { ruta: string; url: string } } = {};

  // Imágenes de visitas (lista de visitas con su mapa de imágenes)
  imagenesVisitas: IVisConImagenes[] = [];

  // Soportes resueltos (muestra nombres gracias al JOIN)
  soportesResueltos: SoporteView[] = [];

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

        const ordIns = String(
          this.servicioSeleccionado?.orden_instalacion ?? ''
        ).trim();

        this.cargarImagenesInstalacion(ordIns);
        this.cargarImagenesVisitas(ordIns);
        await this.cargarSoportesResueltos(ordIns);
      } else {
        this.clearClienteRelacionado();
      }
    } catch {
      // silencioso
    }
  }

  // === Soportes resueltos por ORD_INS ===
  private async cargarSoportesResueltos(
    ordIns: string | number
  ): Promise<void> {
    const ord = Number(ordIns);
    if (!Number.isFinite(ord)) {
      this.soportesResueltos = [];
      return;
    }
    try {
      const data = await this.soportesService.getAllResueltosSopByOrdIns(ord);
      this.soportesResueltos = Array.isArray(data)
        ? (data as SoporteView[])
        : [];
    } catch {
      this.soportesResueltos = [];
    }
  }

  // === Modal imagen ===
  abrirImagenModal(url: string) {
    this.imagenSeleccionada = url;
    const modal = new Modal(document.getElementById('modalImagenAmpliada')!);
    modal.show();
  }

  // === Instalación -> nuevo backend (module='instalaciones') ===
  private cargarImagenesInstalacion(ordIns: string | number): void {
    const id = String(ordIns ?? '').trim();
    if (!id) return;

    this.imagesService.list('instalaciones', id).subscribe({
      next: (items) => {
        this.imagenesInstalacion = this.adaptInstToLegacyMap(items);
      },
      error: () => {
        this.imagenesInstalacion = {};
      },
    });
  }

  // === Visitas por ORD_INS -> nuevo backend (module='visitas') ===
  private async cargarImagenesVisitas(ord_Ins: string | number): Promise<void> {
    return new Promise<void>((resolve) => {
      const ord = String(ord_Ins ?? '').trim();
      if (!ord) {
        this.imagenesVisitas = [];
        return resolve();
      }

      this.imagesService.listVisitasByOrdIns(ord).subscribe({
        next: (visitas) => {
          const arr = Array.isArray(visitas)
            ? visitas
            : visitas
            ? [visitas]
            : [];
          this.imagenesVisitas = (arr as any[]).map((v) => ({
            ...v,
            imagenes: this._adaptVisitaImgsToLegacyMap(v?.imagenes),
          }));
          resolve();
        },
        error: () => {
          this.imagenesVisitas = [];
          resolve();
        },
      });
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

  // Igual que en InfoSop: normaliza { img_1..img_4 } desde mapa/array
  private _adaptVisitaImgsToLegacyMap(
    imgs: Record<string, any> | ImageItem[] | undefined
  ): Record<string, { url: string; ruta: string }> {
    const out: Record<string, { url: string; ruta: string }> = {};

    if (imgs && !Array.isArray(imgs)) {
      for (const [k, v] of Object.entries(imgs)) {
        const url = (v as any)?.url || (v as any)?.ruta || '';
        if (!url) continue;
        out[k] = { url, ruta: url };
      }
      return out;
    }

    const arr = Array.isArray(imgs) ? (imgs as ImageItem[]) : [];
    for (const it of arr) {
      const tag = (it.tag || 'img').trim();
      const pos = typeof it.position === 'number' ? it.position : 0;

      const key =
        tag === 'img' && pos > 0
          ? `img_${pos}`
          : pos > 0
          ? `${tag}_${pos}`
          : tag;

      const url =
        (it as any).url ||
        (it as any).ruta_absoluta ||
        (it as any).ruta_relativa ||
        '';
      if (!url) continue;
      out[key] = { url, ruta: url };
    }

    return out;
  }

  onServicioSeleccionado() {
    const ordIns = String(
      this.servicioSeleccionado?.orden_instalacion ?? ''
    ).trim();
    if (ordIns) {
      this.cargarImagenesInstalacion(ordIns);
      this.cargarImagenesVisitas(ordIns);
      void this.cargarSoportesResueltos(ordIns);
    } else {
      this.soportesResueltos = [];
    }
  }

  // === Utilidades ===
  private clearClienteRelacionado() {
    this.busqueda = '';
    this.busquedaCedula = '';
    this.clienteSeleccionado = null;
    this.servicioSeleccionado = null;
    this.imagenesInstalacion = {};
    this.imagenesVisitas = [];
    this.soportesResueltos = [];
    this.imagenSeleccionada = null;
  }

  formatIpUrl(ip?: string): string {
    if (!ip) return '#';
    const clean = ip.trim();
    return /^https?:\/\//i.test(clean) ? clean : `http://${clean}`;
  }
}
