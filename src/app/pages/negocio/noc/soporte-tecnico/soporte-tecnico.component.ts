import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-soporte-tecnico',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './soporte-tecnico.component.html',
  styleUrl: './soporte-tecnico.component.css',
})
export class SoporteTecnicoComponent {
  clienteService = inject(ClientesService);
  authService = inject(AutenticacionService);
  soporteService = inject(SoportesService);
  private router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  clientelista: Iclientes[] = [];
  soportesPendientes: Isoportes[] = [];
  soportesNoc: Isoportes[] = [];
  datosUsuario: any;
  isLoading = true; // Nueva variable para controlar carga de datos

  async ngOnInit() {
    try {
      this.datosUsuario = this.authService.datosLogged();
      let noc_id = this.datosUsuario.usuario_id;
      console.log(noc_id);

      // Ejecutar consultas en paralelo para mayor eficiencia
      let [soportesPend, soportesNoc] = await Promise.all([
        this.soporteService.getAllPendientes(),
        this.soporteService.getbyNocId(noc_id),
      ]);

      // Asignar datos a las variables
      this.soportesPendientes = soportesPend;
      this.soportesNoc = soportesNoc;
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    } finally {
      this.isLoading = false; // Se ejecuta siempre, éxito o error
    }
  }
  calcularTiempoTranscurrido(fechaInicio: Date, fechaFin: Date): string {
    if (!fechaInicio || !fechaFin) {
      return 'N/A';
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();

    if (diferencia <= 0) {
      return '0 días 0 horas 0 minutos';
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor(
      (diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    return `${dias} días ${horas} horas ${minutos} minutos`;
  }
}
