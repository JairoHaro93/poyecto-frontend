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
import { ImagenesService } from '../../../../services/negocio_latacunga/imagenes.service';
import { Modal } from 'bootstrap';
import { VisService } from '../../../../services/negocio_latacunga/vis.service';
import { IVis } from '../../../../interfaces/negocio/vis/vis.interface';
import { IVisConImagenes } from '../../../../interfaces/negocio/imagenes/imagenes.interface';

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
  imagenesService = inject(ImagenesService);
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

  async ngOnInit() {
    this.datosUsuario = await this.authService.getUsuarioAutenticado();
    this.activatedRoute.params.subscribe(async (params: any) => {
      this.id_sop = params['id_sop'];
      this.ord_Ins = params['ord_ins'];

      if (!this.id_sop) {
        console.error("Error: 'id_sop' no válido");
        return;
      }

      await this.cargarSoporte(this.id_sop, this.ord_Ins);
      this.cargarImagenesInstalacion('neg_t_instalaciones', this.ord_Ins);
      await this.cargarImagenesVisitas('neg_t_vis', this.ord_Ins);
    });
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

  private async cargarImagenesVisitas(
    tabla: string,
    ord_Ins: string
  ): Promise<void> {
    try {
      this.imagenesVisitas =
        await this.imagenesService.getArrayAllInfoVisitasByTableAndId(
          tabla,
          ord_Ins
        );
      console.log(this.imagenesVisitas);
    } catch (err) {
      console.error('❌ Error cargando imágenes de visitas:', err);
      this.imagenesVisitas = [];
    }
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
