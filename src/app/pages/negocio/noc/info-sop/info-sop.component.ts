import { Component, inject } from '@angular/core';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';
import { DatePipe } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import Swal from 'sweetalert2';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { environment } from '../../../../../environments/environment';
import { io } from 'socket.io-client';
import { SoketService } from '../../../../services/socket_io/soket.service';

import { Modal } from 'bootstrap';
import { VisService } from '../../../../services/negocio_latacunga/vis.service';
import { IVis } from '../../../../interfaces/negocio/vis/vis.interface';
import { IVisConImagenes } from '../../../../interfaces/negocio/imagenes/imagenes.interface';
import { ImagesService } from '../../../../services/negocio_latacunga/images.service';
import { ImageItem } from '../../../../interfaces/negocio/images/images';

@Component({
  selector: 'app-info-sop',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './info-sop.component.html',
  styleUrl: './info-sop.component.css',
})
export class InfoSopComponent {
  soporte: Isoportes | null = null;
  activatedRoute = inject(ActivatedRoute);
  authService = inject(AutenticacionService);
  soporteService = inject(SoportesService);
  agendaService = inject(AgendaService);

  imagesService = inject(ImagesService);
  visService = inject(VisService);

  private router = inject(Router);

  datosUsuario: any;
  datosNoc: any;
  clienteService = inject(ClientesService);
  clientelista: Iclientes[] = [];
  clienteSeleccionado: Iclientes | null = null;
  servicioSeleccionado: any = null;
  solucionSeleccionada: string = 'REVISION';
  detalleSolucion: string = '';

  imagenSeleccionada: string | null = null;

  id_sop: any;
  ord_Ins: any;

  imagenesInstalacion: { [key: string]: { ruta: string; url: string } } = {};

  imagenesVisitas: IVisConImagenes[] = [];

  private socketService = inject(SoketService);

  // ✅ Suavizado de render (NUEVO)
  isReady = false;

  async ngOnInit() {
    this.datosUsuario = await this.authService.getUsuarioAutenticado();
    this.activatedRoute.params.subscribe(async (params: any) => {
      this.isReady = false; // ← oculta el contenido
      this.id_sop = params['id_sop'];
      this.ord_Ins = params['ord_ins'];

      if (!this.id_sop) {
        console.error("Error: 'id_sop' no válido");
        this.isReady = true;
        return;
      }

      try {
        await this.cargarSoporte(this.id_sop, this.ord_Ins);
        this.cargarImagenesInstalacion('neg_t_instalaciones', this.ord_Ins);
        await this.cargarImagenesVisitas('neg_t_vis', this.ord_Ins);
      } catch (e) {
        console.error('❌ Error inicial InfoSop:', e);
      } finally {
        this.isReady = true; // ⬅️ muestra el contenido
      }
    });
  }
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

  private async cargarImagenesVisitas(
    _tabla: string,
    ord_Ins: string
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!ord_Ins) {
        this.imagenesVisitas = [];
        return resolve();
      }

      // Log para verificar que el ord_ins y la URL sean los correctos
      console.debug(
        '[VIS][InfoSop] GET:',
        `${environment.API_URL}/images/visitas/by-ord/${ord_Ins}`
      );

      this.imagesService.listVisitasByOrdIns(ord_Ins).subscribe({
        next: (visitas) => {
          // Defensivo: si por algo llega objeto en vez de array
          const arr = Array.isArray(visitas)
            ? visitas
            : visitas
            ? [visitas]
            : [];
          this.imagenesVisitas = arr as any; // tipa a IVisConImagenes[] si coincide

          // Logs útiles para validar contenido en el navegador (como en Postman)
          console.debug('[VIS][InfoSop] visitas ->', this.imagenesVisitas);
          console.debug(
            '[VIS][InfoSop] keys por visita ->',
            this.imagenesVisitas.map((v: any) => ({
              id: v.id,
              keys: Object.keys(v?.imagenes || {}),
            }))
          );

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

  async cargarSoporte(id: number, ord_ins: number): Promise<void> {
    try {
      this.datosUsuario = await this.authService.getUsuarioAutenticado();
      const reg_sop_registrado_por_id = this.datosUsuario.id;

      const body = { reg_sop_noc_id_acepta: reg_sop_registrado_por_id };
      await this.soporteService.aceptarSoporte(id, body);

      this.soporte = await this.soporteService.getSopById(id);
      this.solucionSeleccionada = this.soporte?.reg_sop_estado || 'REVISION';
      this.detalleSolucion = this.soporte?.reg_sop_sol_det || '';

      this.servicioSeleccionado =
        await this.clienteService.getInfoServicioByOrdId(ord_ins);
    } catch (error) {
      console.error('❌ Error al cargar soporte:', error);
    }
  }
  // Convierte ImageItem[] => { [clave]: { url, ruta } }
  // clave = tag o tag_position si position > 0 (p.ej. 'router' o 'router_1')
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

      // Usa la URL servida por el backend nuevo; fallback si viniera con otros campos
      const url =
        it.url ?? (it as any).ruta_absoluta ?? (it as any).ruta_relativa ?? '';
      if (!url) continue;

      map[key] = { url, ruta: url };
    }
    return map;
  }

  copyIp(ip: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = ip;
    textarea.style.position = 'fixed'; // Evita scroll
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const successful = document.execCommand('copy');
      console.log(successful ? 'IP copiada' : 'No se pudo copiar');
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
    console.log('Solución seleccionada:', this.solucionSeleccionada);
  }

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

      if (result.isConfirmed) {
        try {
          await this.soporteService.actualizarEstadoSop(this.id_sop, body);
          console.log('lo ha resuelto');
          this.router.navigateByUrl('/home/noc/soporte-tecnico');
        } catch ({ error }: any) {
          console.error(error);
          Swal.fire({
            title: 'Ocurrió un error al cerrar el soporte.',
            text: error.message,
            icon: 'error',
          });
          return;
        }
        return;
      } else {
        console.log('⛔ El soporte no fue marcado como resuelto.');

        Swal.fire({
          title: 'Acción cancelada',
          text: 'El soporte no ha sido marcado como resuelto.',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }
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

      if (result.isConfirmed) {
        try {
          let bodyVis: any = {
            ord_ins: this.ord_Ins,
            vis_estado: 'PENDIENTE',
            vis_diagnostico: this.detalleSolucion,
            vis_coment_cliente: this.soporte!.reg_sop_coment_cliente,
          };

          if (this.solucionSeleccionada === 'VISITA') {
            bodyVis.vis_tipo = 'VISITA';
          } else {
            bodyVis.vis_tipo = 'LOS';
          }

          const result = await this.visService.createVis(bodyVis);

          await this.soporteService.actualizarEstadoSop(this.id_sop, body);

          let bodyAge: any = {
            ord_ins: this.ord_Ins,
            age_id_tipo: result.id,
            age_id_sop: this.id_sop,
            age_diagnostico: this.detalleSolucion,
            age_coordenadas: this.servicioSeleccionado.servicios[0].coordenadas,
            age_telefono: this.soporte?.reg_sop_tel,
          };

          if (this.solucionSeleccionada === 'VISITA') {
            bodyAge.age_tipo = 'VISITA';
          } else {
            bodyAge.age_tipo = 'LOS';
          }

          await this.agendaService.postSopAgenda(bodyAge);

          this.socketService.emit('trabajoPreagendado');
          this.router.navigateByUrl('/home/noc/soporte-tecnico');
        } catch ({ error }: any) {
          console.error(error);
          Swal.fire({
            title: 'Error!',
            text: error.message,
            icon: 'error',
          });
          return;
        }
        return;
      } else {
        Swal.fire({
          title: 'Cancelado',
          text: 'El soporte no fue agendado.',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }
    } else {
      try {
        // await this.soporteService.actualizarEstadoSop(this.id_sop, body);

        //    this.router.navigateByUrl('/home/noc/soporte-tecnico');

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
        if (result.isConfirmed) {
          try {
            await this.soporteService.actualizarEstadoSop(this.id_sop, body);
            //  await this.agendaService.postSopAgenda(bodyAge);
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
        } else {
          Swal.fire({
            title: 'Cancelado',
            text: 'El soporte no fue agendado.',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: 'Error!',
          text: 'Ocurrió un error al cerrar el soporte.',
          icon: 'error',
        });
        return;
      }
    }
  }
}
