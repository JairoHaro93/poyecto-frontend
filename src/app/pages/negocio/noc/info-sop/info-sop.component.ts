import { Component, inject } from '@angular/core';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';
import { DatePipe } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-info-sop',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './info-sop.component.html',
  styleUrl: './info-sop.component.css',
})
export class InfoSopComponent {
  soporte: Isoportes | null = null;
  activatedRoute = inject(ActivatedRoute);
  authService = inject(AutenticacionService);
  soporteService = inject(SoportesService);

  datosUsuario: any;
  datosNoc: any;
  clienteService = inject(ClientesService);
  clientelista: Iclientes[] = [];
  clienteSeleccionado: Iclientes | null = null;
  servicioSeleccionado: any = null;
  solucionSeleccionada: any;

  async ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      let ord_ins = parseInt(params.ord_ins, 10); // Convertir a número
      if (!ord_ins) {
        console.error("Error: 'ord_ins' no válido");
        return;
      }
      this.cargarSoporte(ord_ins);
    });
  }

  async cargarSoporte(ord_ins: number) {
    try {
      // Obtener datos del usuario autenticado
      this.datosUsuario = this.authService.datosLogged();
      let reg_sop_registrado_por_id = this.datosUsuario.usuario_id;

      // Crear el objeto `body` con los datos requeridos
      const body = { reg_sop_noc_id_acepta: reg_sop_registrado_por_id };

      // Asegurar que `aceptarSoporte` se ejecute primero
      const response = await this.soporteService.aceptarSoporte(ord_ins, body);
      console.log('Soporte aceptado con éxito:', response);

      // Después de aceptar el soporte, obtener los datos del soporte
      this.soporte = await this.soporteService.getbyOrdnIns(ord_ins);

      this.servicioSeleccionado =
        await this.clienteService.getInfoServicioByOrdId(ord_ins);

      console.log(this.servicioSeleccionado);

      console.log('Datos del soporte obtenidos:', this.soporte);
    } catch (error) {
      console.error('Error al aceptar soporte:', error);
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
    const body = { reg_sop_estado: this.solucionSeleccionada };

    await this.soporteService.actualizarSopEstado(
      this.servicioSeleccionado.orden_instalacion,
      body
    );
  }
}
