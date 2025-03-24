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

@Component({
  selector: 'app-info-sop',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './info-sop.component.html',
  styleUrl: './info-sop.component.css',
})
export class InfoSopComponent {
  soporte: Isoportes | null = null;
  activatedRoute = inject(ActivatedRoute);
  authService = inject(AutenticacionService);
  soporteService = inject(SoportesService);
  private router = inject(Router);
  datosUsuario: any;
  datosNoc: any;
  clienteService = inject(ClientesService);
  clientelista: Iclientes[] = [];
  clienteSeleccionado: Iclientes | null = null;
  servicioSeleccionado: any = null;
  solucionSeleccionada: string = 'REVISION';

  id_sop: any;

  async ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.id_sop = params['id_sop'];
      const ordIns = params['ord_ins'];
      console.log(this.id_sop, ordIns);

      if (!this.id_sop) {
        console.error("Error: 'id' no válido");
        return;
      }

      this.cargarSoporte(this.id_sop, ordIns);
    });
  }

  async cargarSoporte(id_sop: number, ord_ins: number): Promise<void> {
    console.log('ID Soporte:', id_sop, 'Orden Instalación:', ord_ins);

    try {
      // Obtener datos del usuario autenticado
      this.datosUsuario = this.authService.datosLogged();

      const reg_sop_registrado_por_id = this.datosUsuario?.usuario_id;
      if (!reg_sop_registrado_por_id) {
        throw new Error('No se pudo obtener el ID del usuario autenticado.');
      }

      // Crear el objeto `body` con los datos requeridos
      const body = { reg_sop_noc_id_acepta: reg_sop_registrado_por_id };

      // Asegurar que `aceptarSoporte` se ejecute primero
      const response = await this.soporteService.aceptarSoporte(id_sop, body);
      console.log('✅ Soporte aceptado con éxito:', response);

      // Después de aceptar el soporte, obtener los datos del soporte
      this.soporte = await this.soporteService.getbyId(id_sop);
      console.log('📄 Datos del soporte obtenidos:', this.soporte);

      // Obtener información del servicio usando `ord_ins`
      this.servicioSeleccionado =
        await this.clienteService.getInfoServicioByOrdId(ord_ins);
      console.log('📡 Servicio seleccionado:', this.servicioSeleccionado);
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
    if (this.solucionSeleccionada === 'RESUELTO') {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'El Soporte se ha resuelto satisfactoriamente?.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, He resuelto el soporte',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const body = { reg_sop_estado: this.solucionSeleccionada };
            await this.soporteService.actualizarSopEstado(this.id_sop, body);

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
        }
      });
    } else {
      try {
        const body = { reg_sop_estado: this.solucionSeleccionada };
        await this.soporteService.actualizarSopEstado(this.id_sop, body);
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
