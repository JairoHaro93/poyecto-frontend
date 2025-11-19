import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Modal } from 'bootstrap';

import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';
import { IVis } from '../../../../interfaces/negocio/vis/vis.interface';
import { IVisConImagenes } from '../../../../interfaces/negocio/imagenes/imagenes.interface';
import { ImageItem } from '../../../../interfaces/negocio/images/images';

import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { ImagesService } from '../../../../services/negocio_latacunga/images.service';
import { VisService } from '../../../../services/negocio_latacunga/vis.service';
import { SoketService } from '../../../../services/socket_io/soket.service';

import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-info-sop',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './info-sop.component.html',
  styleUrls: ['./info-sop.component.css'],
})
export class InfoSopComponent implements OnInit, OnDestroy {
  // ====== Inputs / estado ======
  @Input() ordIns!: number | string; // viene del detalle actual (opcional si hay ruta)

  soporte: Isoportes | null = null;
  soportesResueltos: Isoportes[] = [];

  loadingSoportes = false;
  errorSoportes: string | null = null;

  isReady = false;
  imagenSeleccionada: string | null = null;

  // Ruta
  id_sop: number | null = null;
  ord_Ins: string = '';

  // Datos/servicios
  datosUsuario: any;
  datosNoc: any;
  clientelista: Iclientes[] = [];
  clienteSeleccionado: Iclientes | null = null;
  servicioSeleccionado: any = null;

  solucionSeleccionada: string = 'REVISION';
  detalleSolucion: string = '';

  imagenesInstalacion: Record<string, { ruta: string; url: string }> = {};
  imagenesVisitas: IVisConImagenes[] = [];

  // ====== Inyección (consistente) ======
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  private authService = inject(AutenticacionService);
  private soportesService = inject(SoportesService);
  private agendaService = inject(AgendaService);
  private imagesService = inject(ImagesService);
  private visService = inject(VisService);
  private clienteService = inject(ClientesService);
  private socketService = inject(SoketService);

  private paramsSub: any;

  async ngOnInit(): Promise<void> {
    this.datosUsuario = await this.authService.getUsuarioAutenticado();

    // Si ya viene ordIns por @Input, carga listado
    if (
      this.ordIns !== undefined &&
      this.ordIns !== null &&
      `${this.ordIns}`.trim() !== ''
    ) {
      await this.cargarSoportes();
    }

    // Manejo por ruta (id_sop / ord_ins)
    this.paramsSub = this.activatedRoute.params.subscribe(
      async (params: any) => {
        this.isReady = false;

        this.id_sop = params['id_sop'] ? Number(params['id_sop']) : null;
        this.ord_Ins = String(params['ord_ins'] ?? '').trim();

        if (!this.id_sop) {
          console.error("Error: 'id_sop' no válido");
          this.isReady = true;
          return;
        }

        try {
          await this.cargarSoporte(this.id_sop, this.ord_Ins);

          // Si no vino @Input, usa la de ruta para el listado
          if (
            this.ordIns === undefined ||
            this.ordIns === null ||
            `${this.ordIns}`.trim() === ''
          ) {
            this.ordIns = this.ord_Ins;
            await this.cargarSoportes();
          }

          this.cargarImagenesInstalacion('neg_t_instalaciones', this.ord_Ins);
          await this.cargarImagenesVisitas(this.ord_Ins);
        } catch (e) {
          console.error('❌ Error inicial InfoSop:', e);
        } finally {
          this.isReady = true;
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.paramsSub && typeof this.paramsSub.unsubscribe === 'function') {
      this.paramsSub.unsubscribe();
    }
  }

  // ====== Listado de soportes resueltos ======

  async cargarSoportes(): Promise<void> {
    this.loadingSoportes = true;
    this.errorSoportes = null;
    try {
      const ord =
        typeof this.ordIns === 'string' ? Number(this.ordIns) : this.ordIns;
      if (!Number.isFinite(ord as number)) {
        this.soportesResueltos = [];
        this.errorSoportes = 'ord_ins inválido para cargar soportes.';
      } else {
        const data = await this.soportesService.getAllResueltosSopByOrdIns(
          ord as number
        );
        this.soportesResueltos = Array.isArray(data) ? data : [];
      }
    } catch {
      this.errorSoportes = 'No se pudieron cargar los soportes resueltos.';
    } finally {
      this.loadingSoportes = false;
    }
  }
  recargar(): void {
    void this.cargarSoportes();
  }

  // ====== Carga detalle del soporte actual ======
  async cargarSoporte(id: number, ord_ins: string | number): Promise<void> {
    try {
      this.datosUsuario = await this.authService.getUsuarioAutenticado();
      const reg_sop_registrado_por_id = this.datosUsuario?.id;

      // Si luego se re-activa aceptar:
      // await this.soportesService.aceptarSoporte(id, { reg_sop_noc_id_acepta: reg_sop_registrado_por_id });

      this.soporte = await this.soportesService.getSopById(id);
      this.solucionSeleccionada = this.soporte?.reg_sop_estado || 'REVISION';
      this.detalleSolucion = this.soporte?.reg_sop_sol_det || '';

      const ordNum = Number(ord_ins);
      if (Number.isFinite(ordNum)) {
        this.servicioSeleccionado =
          await this.clienteService.getInfoServicioByOrdId(ordNum);
      } else {
        console.warn(
          '[InfoSop] ord_ins no numérico para getInfoServicioByOrdId:',
          ord_ins
        );
        this.servicioSeleccionado = null;
      }
    } catch (error) {
      console.error('❌ Error al cargar soporte:', error);
    }
  }

  // ====== Imágenes instalación ======
  private cargarImagenesInstalacion(_: string, ord_Ins: string): void {
    this.imagesService.list('instalaciones', ord_Ins).subscribe({
      next: (items) => {
        this.imagenesInstalacion = this.adaptInstToLegacyMap(items);
      },
      error: (err) => {
        console.error('❌ Error cargando imágenes (instalación):', err);
        this.imagenesInstalacion = {};
      },
    });
  }

  // ====== Imágenes visitas ======
  private async cargarImagenesVisitas(ord_Ins: string): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!ord_Ins) {
        this.imagenesVisitas = [];
        return resolve();
      }

      console.debug(
        '[VIS][InfoSop] GET:',
        `${environment.API_URL}/images/visitas/by-ord/${ord_Ins}`
      );

      this.imagesService.listVisitasByOrdIns(ord_Ins).subscribe({
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
        error: (err) => {
          console.error('❌ Error cargando imágenes de visitas:', err);
          this.imagenesVisitas = [];
          resolve();
        },
      });
    });
  }

  // Convierte ImageItem[] => { [clave]: { url, ruta } }
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

      const url =
        it.url ?? (it as any).ruta_absoluta ?? (it as any).ruta_relativa ?? '';
      if (!url) continue;

      map[key] = { url, ruta: url };
    }
    return map;
  }

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

  // ====== Utilitarios ======
  copyIp(ip: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = ip;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Error al copiar IP: ', err);
    }
    document.body.removeChild(textarea);
  }

  abrirImagenModal(url: string) {
    this.imagenSeleccionada = url;
    const modal = new Modal(document.getElementById('modalImagenAmpliada')!);
    modal.show();
  }

  asignarSolucion(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.solucionSeleccionada = inputElement.value;
  }

  // ====== Guardar solución ======
  async guardarSolucion() {
    if (!this.solucionSeleccionada) {
      Swal.fire({
        title: 'Advertencia',
        text: 'Debes seleccionar un estado de solución.',
        icon: 'warning',
      });
      return;
    }
    if (!this.detalleSolucion || !this.detalleSolucion.trim()) {
      Swal.fire({
        title: 'Advertencia',
        text: 'La descripción de la solución no puede estar vacía.',
        icon: 'warning',
      });
      return;
    }

    const body = {
      reg_sop_estado: this.solucionSeleccionada,
      reg_sop_sol_det: this.detalleSolucion.trim(),
      reg_sop_noc_id_acepta: this.datosUsuario?.id,
    };

    if (this.solucionSeleccionada === 'RESUELTO') {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿El soporte se ha resuelto satisfactoriamente?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, he resuelto el soporte',
        cancelButtonText: 'Cancelar',
      });

      if (!result.isConfirmed) {
        Swal.fire({
          title: 'Acción cancelada',
          text: 'El soporte no ha sido marcado como resuelto.',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      try {
        await this.soportesService.actualizarEstadoSop(
          String(this.id_sop),
          body
        );
        this.router.navigateByUrl('/home/noc/soporte-tecnico');
      } catch ({ error }: any) {
        console.error(error);
        Swal.fire({
          title: 'Ocurrió un error al cerrar el soporte.',
          text: error?.message,
          icon: 'error',
        });
      }
      return;
    }

    if (
      this.solucionSeleccionada === 'LOS' ||
      this.solucionSeleccionada === 'VISITA'
    ) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿AGREGAR EL SOPORTE A LA AGENDA?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, debe agregarse a la agenda',
        cancelButtonText: 'Cancelar',
      });

      if (!result.isConfirmed) {
        Swal.fire({
          title: 'Cancelado',
          text: 'El soporte no fue agendado.',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      try {
        // 1) Actualiza estado del soporte
        await this.soportesService.actualizarEstadoSop(
          String(this.id_sop),
          body
        );

        // 2) Crea agenda
        const ageTipo =
          this.solucionSeleccionada === 'VISITA' ? 'VISITA' : 'LOS';
        const coords =
          this.servicioSeleccionado?.servicios?.[0]?.coordenadas ?? null;

        const bodyAge: any = {
          ord_ins: this.ord_Ins,
          age_id_sop: this.id_sop,
          age_diagnostico: this.detalleSolucion,
          age_coordenadas: coords,
          age_telefono: this.soporte?.reg_sop_tel,
          age_tipo: ageTipo,
        };

        await this.agendaService.postSopAgenda(bodyAge);

        // 3) Notifica por socket y navega
        this.socketService.emit('trabajoPreagendado');
        this.router.navigateByUrl('/home/noc/soporte-tecnico');
      } catch ({ error }: any) {
        console.error(error);
        Swal.fire({ title: 'Error!', text: error?.message, icon: 'error' });
      }
      return;
    }

    // Otros estados
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿GUARDAR LA SOLUCION?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) {
      Swal.fire({
        title: 'Cancelado',
        text: 'El soporte no fue agendado.',
        icon: 'info',
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await this.soportesService.actualizarEstadoSop(String(this.id_sop), body);
      this.socketService.emit('trabajoPreagendado');
      this.router.navigateByUrl('/home/noc/soporte-tecnico');
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error!',
        text: 'Ocurrió un error al cerrar el soporte.',
        icon: 'error',
      });
    }
  }
}
