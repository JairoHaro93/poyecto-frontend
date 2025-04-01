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

@Component({
  selector: 'app-soporte-tecnico',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './soporte-tecnico.component.html',
  styleUrl: './soporte-tecnico.component.css',
})
export class SoporteTecnicoComponent implements OnDestroy {
  //private socket = io('http://localhost:3000'); // Conexión con WebSocket
  private socket = io(`${environment.API_WEBSOKETS_IO}`); // Conexión con WebSocket
  clienteService = inject(ClientesService);
  authService = inject(AutenticacionService);
  soporteService = inject(SoportesService);
  private router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  soportesPendientes: Isoportes[] = [];
  soportesNoc: Isoportes[] = [];
  datosUsuario: any;
  isLoading = true;

  constructor(private dataSharingService: DataSharingService) {}

  async ngOnInit() {
    //this.reproducirSonido(); // Ve
    this.datosUsuario = this.authService.datosLogged();
    let noc_id = this.datosUsuario.usuario_id;

    await this.cargarDatos(noc_id);

    // Escuchar evento de actualización desde el servidor
    this.socket.on('actualizarSoportes', async () => {
      console.log(
        '🔄 Recibiendo actualización de soportes en SoporteTecnicoComponent'
      );

      const soportesPrevios = [...this.soportesPendientes]; // Guardar lista anterior

      await this.cargarDatos(noc_id); // Cargar nuevos datos
    });

    // 📢 Escuchar cuando se crea un nuevo soporte y reproducir sonido
    this.socket.on('soporteCreado', async () => {
      console.log('📢 Se ha creado un nuevo soporte.');

      const soportesPrevios = [...this.soportesPendientes]; // Guardar lista anterior

      await this.cargarDatos(noc_id); // Cargar nuevos datos
    });
  }

  async cargarDatos(noc_id: string) {
    try {
      this.isLoading = true;
      let [soportesPend, soportesNoc] = await Promise.all([
        this.soporteService.getAllPendientes(),
        this.soporteService.getSopByNocId(noc_id),
      ]);

      this.soportesPendientes = soportesPend;
      this.soportesNoc = soportesNoc;
    } catch (error) {
      console.error('Error al cargar los datos:', error);
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

  async aceptarSoporte(id_sop: string, ord_ins: string) {
    try {
      // Obtener datos del usuario autenticado
      this.datosUsuario = this.authService.datosLogged();
      let reg_sop_registrado_por_id = this.datosUsuario.usuario_id;

      // Crear el objeto `body` con los datos requeridos
      const body = { reg_sop_noc_id_acepta: reg_sop_registrado_por_id };

      // Asegurar que `aceptarSoporte` se ejecute primero
      await this.soporteService.aceptarSoporte(id_sop, body);
      console.log(`✅ Soporte ${id_sop} aceptado con éxito`);

      this.dataSharingService.updateData(
        this.soportesPendientes.length,
        this.soportesNoc.length
      );

      // Emitir evento de actualización para otros clientes
      this.socket.emit('soporteActualizado');

      console.log('📢 Soporte actualizado en tiempo real');

      await this.router.navigateByUrl(
        `/home/noc/info-sop/${id_sop}/${ord_ins}`
      );
    } catch (error) {
      console.error('❌ Error al aceptar soporte:', error);
    }
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }
}
