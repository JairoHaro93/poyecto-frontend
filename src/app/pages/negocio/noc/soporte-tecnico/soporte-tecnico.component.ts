import { Component, inject, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { io } from 'socket.io-client';
import { DataSharingService } from '../../../../services/data-sharing.service';
import { environment } from '../../../../../environments/environment';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { SoketService } from '../../../../services/socket_io/soket.service';
import { firstValueFrom } from 'rxjs';

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

  soportesPendientes: Isoportes[] = [];
  soportesNoc: Isoportes[] = [];

  datosUsuario!: Iusuarios;

  private socketService = inject(SoketService);

  isLoading = true;

  constructor(private dataSharingService: DataSharingService) {}

  async ngOnInit() {
    try {
      // Obtener datos del usuario autenticado desde cookie JWT
      this.datosUsuario = await this.authService.getUsuarioAutenticado();
      const noc_id = this.datosUsuario.id!;

      this.cargarDatos(noc_id);

      this.socketService.on('soporteCreadoNOC', async () => {
        console.log(
          '📢 Evento recibido EN SOPORTE TECNICO solo por NOC: soporteCreadoNOC'
        );
        await this.cargarDatos(noc_id);
      });

      this.socketService.on('soporteActualizadoNOC', async () => {
        console.log(
          '📢 Evento recibido EN SOPORTE TECNICO solo por NOC: soporteActualizadoNOC'
        );
        await this.cargarDatos(noc_id);
      });

      this.socketService.on('trabajoCulminadoNOC', async () => {
        console.log('📥 trabajoCulminadoNOC recibido');
        await this.cargarDatos(noc_id);
      });
    } catch (error) {
      console.error('❌ Error al iniciar soporte técnico:', error);
      this.router.navigateByUrl('/login');
    }
  }
  async cargarDatos(noc_id: number) {
    try {
      this.isLoading = true;
      this.isReady = false;

      const [soportesPend, soportesNoc] = await Promise.all([
        this.soporteService.getAllPendientes(),
        this.soporteService.getSopByNocId(noc_id),
      ]);

      this.soportesPendientes = soportesPend;
      this.soportesNoc = soportesNoc;

      // 1) Reunir ord_ins únicos
      const allOrdIns = [
        ...this.soportesPendientes.map((s) => s.ord_ins),
        ...this.soportesNoc.map((s) => s.ord_ins),
      ].filter((v) => v !== null && v !== undefined);

      const uniqueOrdIns = Array.from(new Set(allOrdIns));

      // 2) Enriquecimiento batch (si hay algo que enriquecer)
      if (uniqueOrdIns.length > 0) {
        const clientes = await firstValueFrom(
          this.clienteService.getClientesByOrdInsBatch(uniqueOrdIns)
        );

        const mapCliente = new Map<string | number, any>();
        (clientes ?? []).forEach((c) => mapCliente.set(c.orden_instalacion, c));

        this.soportesPendientes = this.soportesPendientes.map((s) => {
          const info = mapCliente.get(s.ord_ins);
          return {
            ...s,
            clienteNombre: info?.nombre_completo ?? '',
            clienteCedula: info?.cedula ?? '',
            clienteDireccion: info?.direccion ?? '',
            clienteTelefonos: info?.telefonos ?? '',
            clienteIP: info?.ip ?? '',
            clientePlan: info?.plan_nombre ?? '',
          };
        });

        this.soportesNoc = this.soportesNoc.map((s) => {
          const info = mapCliente.get(s.ord_ins);
          return {
            ...s,
            clienteNombre: info?.nombre_completo ?? '',
            clienteCedula: info?.cedula ?? '',
            clienteDireccion: info?.direccion ?? '',
            clienteTelefonos: info?.telefonos ?? '',
            clienteIP: info?.ip ?? '',
            clientePlan: info?.plan_nombre ?? '',
          };
        });
      }

      // 👉 Deja que el navegador asiente layout/pintado antes de mostrar
      await this.settleFrames();
      this.isReady = true;
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      // Aun con error, evita dejar la UI “en blanco”
      this.isReady = true;
    } finally {
      this.isLoading = false;
    }
  }

  calcularTiempoTranscurrido(fechaInicio: Date, fechaFin: Date): string {
    if (!fechaInicio || !fechaFin) return 'N/A';

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();

    if (diferencia <= 0) return '0 días 0 horas 0 minutos';

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor(
      (diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    return `${dias} días ${horas} horas ${minutos} minutos`;
  }
  async aceptarSoporte(id: number, ord_ins: string) {
    try {
      const usuario = await this.authService.getUsuarioAutenticado();
      const body = { reg_sop_noc_id_acepta: usuario.id };

      await this.soporteService.aceptarSoporte(id, body);
      console.log(`✅ Soporte ${id} aceptado con éxito`);

      this.dataSharingService.updateData(
        this.soportesPendientes.length,
        this.soportesNoc.length
      );

      this.socketService.emit('soporteActualizado');
      console.log('📢 Soporte actualizado en tiempo real');

      await this.router.navigateByUrl(`/home/noc/info-sop/${id}/${ord_ins}`);
    } catch (error) {
      console.error('❌ Error al aceptar soporte:', error);
    }
  }

  // Suavizado de render

  isReady = false;

  private nextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  private async settleFrames(): Promise<void> {
    // 2 frames: layout + paint
    await this.nextFrame();
    await this.nextFrame();
  }
}
