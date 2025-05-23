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
  private router = inject(Router);
  datosUsuario: any;
  datosNoc: any;
  clienteService = inject(ClientesService);
  clientelista: Iclientes[] = [];
  clienteSeleccionado: Iclientes | null = null;
  servicioSeleccionado: any = null;
  solucionSeleccionada: string = 'REVISION';
  detalleSolucion: string = '';

  id_sop: any;
  ord_Ins: any;

  async ngOnInit() {
    this.activatedRoute.params.subscribe(async (params: any) => {
      this.id_sop = params['id_sop'];
      this.ord_Ins = params['ord_ins'];

      if (!this.id_sop) {
        console.error("Error: 'id_sop' no válido");
        return;
      }

      await this.cargarSoporte(this.id_sop, this.ord_Ins);
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

  copyIp(ip: string): void {
    navigator.clipboard
      .writeText(ip)
      .then(() => {
        console.log('IP copiada al portapapeles');
      })
      .catch((err) => {
        console.error('Error al copiar IP: ', err);
      });
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

    const bodyAge = {
      age_ord_ins: this.ord_Ins,
      age_id_sop: this.id_sop,
      age_tipo: 'SOPORTE',
      age_subtipo: this.solucionSeleccionada,
      age_observaciones: this.detalleSolucion,
      age_coordenadas: this.servicioSeleccionado.servicios[0].coordenadas,
      age_telefono: this.soporte?.reg_sop_tel,
    };
    console.log(bodyAge);
    if (this.solucionSeleccionada === 'RESUELTO') {
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿El soporte se ha resuelto satisfactoriamente?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, he resuelto el soporte',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await this.soporteService.actualizarEstadoSop(this.id_sop, body);
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
      });
    }

    if (
      this.solucionSeleccionada === 'VISITA' ||
      this.solucionSeleccionada === 'LOS'
    ) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿AGREGAR EL SOPORTE A LA AGENDA?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, debe agregarse a la agenda',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await this.soporteService.actualizarEstadoSop(this.id_sop, body);

            //AGREGAR EL SOPORTE A LA AGENDA

            await this.agendaService.postSopAgenda(bodyAge);

            console.log(bodyAge);

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
      });
    } else {
      try {
        await this.soporteService.actualizarEstadoSop(this.id_sop, body);

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
}
