// ==========================
// AGENDA COMPONENT TS
// ==========================

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { Iagenda } from '../../../../interfaces/negocio/agenda/iagenda.interface';
import {
  ClienteBatchItem,
  ClientesService,
} from '../../../../services/negocio_atuntaqui/clientes.service';

import Swal from 'sweetalert2';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { SoketService } from '../../../../services/socket_io/soket.service';
import { ImagenesService } from '../../../../services/negocio_latacunga/imagenes.service';
import { Modal } from 'bootstrap';
import { firstValueFrom } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css',
})
export class AgendaComponent {
  //servicios
  soporteService = inject(SoportesService);
  clienteService = inject(ClientesService);
  usuariosService = inject(UsuariosService);
  agendaService = inject(AgendaService);
  authService = inject(AutenticacionService);
  private socketService = inject(SoketService);
  imagenesService = inject(ImagenesService);

  //arrays
  tecnicosList: Iusuarios[] = [];
  agendaList: Iagenda[] = [];
  preAgendaList: Iagenda[] = [];

  //variables estrategicas
  preAgendaPendientesCount = 0;
  idTecnico = 0;
  fechaTrabajoSeleccionada = '';
  fechaSeleccionada = this.obtenerFechaHoy();
  nombreDelDia = this.obtenerNombreDelDia(this.fechaSeleccionada);
  pendientes: any;

  trabajoVista: Iagenda | null = null;
  solucionVista: any;
  trabajoSeleccionado: Iagenda | null = null;
  imagenSeleccionada: string | null = null;

  horaInicio = '';
  horaFin = '';
  vehiculoSeleccionado = '';
  modoEdicion = false;
  edicionHabilitada = true;
  datosUsuario!: Iusuarios;
  isReady = false;
  horarios: string[] = [];

  agendaAsignada: { [hora: string]: { [vehiculo: string]: Iagenda | null } } =
    {};

  imagenesInstalacion: { [key: string]: { ruta: string; url: string } } = {};
  imagenesVisita: Record<string, { url: string; ruta: string }> = {};

  vehiculos = [
    { codigo: 'R17', nombre: 'R17 FURGONETA' },
    { codigo: 'R18', nombre: 'R18 CAMIONETA' },
    { codigo: 'R19', nombre: 'R19 CAMION' },
    { codigo: 'R20', nombre: 'R20 MOTO ROJA' },
  ];

  private clienteCache = new Map<string, ClienteBatchItem>();

  //private socket = io(`${environment.API_WEBSOKETS_IO}`); // Conexión con WebSocket

  async ngOnInit() {
    try {
      await this.contarpendientes();

      this.datosUsuario = await this.authService.getUsuarioAutenticado();

      this.generarHorarios();
      await this.cargarAgendaPorFecha();
      await this.cargarPreAgenda();
      this.tecnicosList = await this.usuariosService.getAllAgendaTecnicos();
    } catch (error) {
    } finally {
    }

    // ✅ Escuchar solo eventos dirigidos
    this.socketService.on('trabajoAgendadoNOC', async () => {
      console.log('📥 trabajoAgendadoNOC recibido');
      await this.cargarAgendaPorFecha(); // ya llama enrich adentro
      await this.contarpendientes();
    });

    this.socketService.on('trabajoCulminadoNOC', async () => {
      console.log('📥 trabajoCulminadoNOC recibido');
      await this.cargarAgendaPorFecha(); // ya llama enrich adentro
      await this.contarpendientes();
    });

    this.socketService.on('trabajoPreagendadoNOC', async () => {
      console.log('📥 trabajoPreagendadoNOC recibido');
      await this.contarpendientes();
      const preAgendaPrevio = this.preAgendaPendientesCount;

      await this.cargarPreAgenda(); // ya llama enrich adentro

      if (this.preAgendaPendientesCount > preAgendaPrevio) {
        this.reproducirSonido();
      }
    });
  }

  /**
   * Enriquecer una lista de agenda (agendaList o preAgendaList) con datos del cliente
   * en una sola llamada batch usando ord_ins.
   * - No altera otras propiedades de los items.
   * - Mantiene fallback a nombre_completo existente si no hay datos del batch.
   */
  private async enrichAgendaListBatch(lista: Iagenda[]): Promise<Iagenda[]> {
    if (!Array.isArray(lista) || lista.length === 0) return lista;

    // 1) ord_ins únicos y válidos
    const ords = Array.from(
      new Set(
        lista
          .map((it) => String(it?.ord_ins ?? '').trim())
          .filter((v) => v.length > 0)
      )
    );

    // 2) resolver faltantes (los que no están en cache)
    const faltantes = ords.filter((k) => !this.clienteCache.has(k));

    if (faltantes.length > 0) {
      try {
        const resp = await firstValueFrom(
          this.clienteService.getClientesByOrdInsBatch(faltantes)
        );
        for (const row of resp ?? []) {
          this.clienteCache.set(String(row.orden_instalacion), row);
        }
      } catch (e) {
        console.error('❌ Error batch clientes:', e);
      }
    }

    // 3) merge de datos enriquecidos
    return lista.map((item) => {
      const info = this.clienteCache.get(String(item?.ord_ins ?? ''));
      return {
        ...item,
        // muestra el nombre enriquecido si existe; sino el que ya tenías; sino '---'
        nombre_completo: info?.nombre_completo ?? item.nombre_completo ?? '---',
        // si quieres conservar más campos enriquecidos para futuros usos:
        // @ts-ignore (si tu Iagenda aún no los define)
        clienteCedula: info?.cedula ?? (item as any).clienteCedula,
        // @ts-ignore
        clientePlan: info?.plan_nombre ?? (item as any).clientePlan,
        // @ts-ignore
        clienteIP: info?.ip ?? (item as any).clienteIP,
        // @ts-ignore
        clienteDireccion: info?.direccion ?? (item as any).clienteDireccion,
        // @ts-ignore
        clienteTelefonos: info?.telefonos ?? (item as any).clienteTelefonos,
      };
    });
  }

  async contarpendientes() {
    try {
      const response = await this.agendaService.getAgendaPendienteByFecha(
        this.fechaSeleccionada
      );
      this.pendientes = response.soportes_pendientes;

      console.log('LOS SOPORTES PENDIENTES SON ' + this.pendientes);
    } catch (error) {
      console.error('Error al contar pendientes:', error);
    }
  }
  async cargarAgendaPorFecha() {
    this.contarpendientes();
    try {
      this.agendaList = await this.agendaService.getAgendaByDate(
        this.fechaSeleccionada
      );

      // (si aplicaste el enriquecido por batch)
      if (typeof (this as any).enrichAgendaListBatch === 'function') {
        this.agendaList = await (this as any).enrichAgendaListBatch(
          this.agendaList
        );
      }

      // Limpiar y reconstruir grillas
      this.agendaAsignada = {};
      this.horarios.forEach((hora) => {
        this.agendaAsignada[hora] = {};
        this.vehiculos.forEach((vehiculo) => {
          this.agendaAsignada[hora][vehiculo.codigo] = null;
        });
      });

      this.mapearAgendaDesdeBD();
      this.generarRenderAgenda();

      // 👇 Deja al navegador “asentar” el layout antes de mostrar
      //    await this.settleFrames();
    } catch (error) {
      console.error('❌ Error al cargar la agenda por fecha:', error);
    } finally {
    }
  }

  async guardarAsignacionTrabajo() {
    if (
      !this.horaInicio ||
      !this.horaFin ||
      this.horaInicio >= this.horaFin ||
      !this.vehiculoSeleccionado
    ) {
      Swal.fire({
        icon: 'info',
        title: 'Formulario incompleto',
        text: 'Complete correctamente el horario y vehículo.',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    if (this.hayConflictoDeHorario()) {
      Swal.fire({
        icon: 'warning',
        title: 'Conflicto de Horario',
        text: '⛔ El vehículo ya tiene un trabajo asignado en ese horario.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const nombreTecnico =
      this.tecnicosList.find((t) => t.id === this.idTecnico)?.nombre || '';

    const body: Iagenda = {
      ...this.trabajoSeleccionado!,
      age_fecha: this.fechaTrabajoSeleccionada,
      age_hora_inicio: this.horaInicio,
      age_hora_fin: this.horaFin,
      age_vehiculo: this.vehiculoSeleccionado,
      age_tecnico: this.idTecnico,
    };

    await this.agendaService.actualizarAgendaHorario(body.id, body);
    // Emitir evento de actualización de soportes a través de WebSocket
    this.socketService.emit('trabajoAgendado', {
      tecnicoId: this.idTecnico,
    });

    // ✅ Emitir evento de preagenda para que NOC reciba notificación
    this.socketService.emit('trabajoPreagendado');

    await this.ngOnInit();
    bootstrap.Modal.getInstance(
      document.getElementById('asignarModal')
    )?.hide();
  }

  async cargarPreAgenda() {
    try {
      this.preAgendaList = await this.agendaService.getPreAgenda();
      this.preAgendaPendientesCount = this.preAgendaList.length;

      if (typeof (this as any).enrichAgendaListBatch === 'function') {
        this.preAgendaList = await (this as any).enrichAgendaListBatch(
          this.preAgendaList
        );
      }
    } catch (e) {
      console.error('❌ Error al cargar preagenda:', e);
    } finally {
      this.isReady = true;
    }
  }

  //FUNCIONES DE VISUALIZACION

  mapearAgendaDesdeBD() {
    for (const item of this.agendaList) {
      const inicio = item.age_hora_inicio;
      const fin = item.age_hora_fin;

      let agregar = false;
      for (const hora of this.horarios) {
        const [hInicio, hFin] = hora.split(' - ');
        if (hInicio === inicio) agregar = true;
        if (agregar) this.agendaAsignada[hora][item.age_vehiculo] = item;
        if (hFin === fin) break;
      }
    }
  }

  generarRenderAgenda() {
    this.renderAgenda = {};
    for (const hora of this.horarios) {
      this.renderAgenda[hora] = {};
      for (const vehiculo of this.vehiculos) {
        this.renderAgenda[hora][vehiculo.codigo] = {
          trabajo: this.agendaAsignada[hora][vehiculo.codigo],
          rowspan: 1,
          mostrar: true,
        };
      }
    }
    for (const vehiculo of this.vehiculos) {
      let trabajoPrevio: Iagenda | null = null;
      let bloqueInicio: string | null = null;
      for (let i = 0; i < this.horarios.length; i++) {
        const hora = this.horarios[i];
        const actual = this.renderAgenda[hora][vehiculo.codigo].trabajo;
        if (trabajoPrevio && actual && actual.id === trabajoPrevio.id) {
          this.renderAgenda[hora][vehiculo.codigo].mostrar = false;
          if (bloqueInicio) {
            this.renderAgenda[bloqueInicio][vehiculo.codigo].rowspan++;
          }
        } else {
          bloqueInicio = hora;
        }
        trabajoPrevio = actual;
      }
    }
  }

  reproducirSonido() {
    const audio = new Audio('./sounds/ding_sop.mp3');
    audio
      .play()
      .catch((err) => console.error('🎵 Error al reproducir sonido:', err));
  }

  getEstadoClass(tipo: string | undefined): string {
    switch (tipo) {
      case 'LOS':
        return 'bg-los  text-black';
      case 'VISITA':
        return 'bg-visita text-white';
      case 'INSTALACION':
        return 'bg-instalacion text-green';
      case 'TRABAJO':
        return 'bg-trabajo text-dark';
      case 'TRASLADO EXT':
        return 'bg-traslado-ext text-dark';
      case 'MIGRACION':
        return 'bg-migracion text-white';
      case 'RETIRO':
        return 'bg-retiro text-dark';
      case 'ALMUERZO':
        return 'bg-almuerzo text-white';
      case 'Cancelado':
        return 'bg-danger text-white';
      default:
        return 'bg-light text-muted';
    }
  }

  renderAgenda: {
    [hora: string]: {
      [vehiculo: string]: {
        trabajo: Iagenda | null;
        rowspan: number;
        mostrar: boolean;
      };
    };
  } = {};

  //FUNCIONES DE FECHAS Y HORAS

  generarHorarios() {
    const inicio = 8 * 60;
    const fin = 21 * 60;
    const paso = 15; // PASO EN MINUTOS
    this.horarios = [];
    this.agendaAsignada = {};

    for (let min = inicio; min < fin; min += paso) {
      const hInicio = Math.floor(min / 60);
      const mInicio = min % 60;
      const hFin = Math.floor((min + paso) / 60);
      const mFin = (min + paso) % 60;

      const horaFormateada = `${hInicio.toString().padStart(2, '0')}:${mInicio
        .toString()
        .padStart(2, '0')} - ${hFin.toString().padStart(2, '0')}:${mFin
        .toString()
        .padStart(2, '0')}`;

      this.horarios.push(horaFormateada);
      this.agendaAsignada[horaFormateada] = {};

      this.vehiculos.forEach((vehiculo) => {
        this.agendaAsignada[horaFormateada][vehiculo.codigo] = null;
      });
    }
  }

  getFinHora(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const totalMin = h * 60 + m + 30;
    return `${Math.floor(totalMin / 60)
      .toString()
      .padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`;
  }

  alCambiarFecha() {
    this.nombreDelDia = this.obtenerNombreDelDia(this.fechaSeleccionada);

    this.cargarAgendaPorFecha();
  }

  obtenerFechaHoy(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${(hoy.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
  }

  obtenerNombreDelDia(fecha: string): string {
    const [a, m, d] = fecha.split('-').map(Number);
    return [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ][new Date(a, m - 1, d).getDay()];
  }

  esFechaPasada(fecha: string | null | undefined): boolean {
    if (!fecha) return false;
    const hoy = new Date().setHours(0, 0, 0, 0);
    const fechaTrabajo = new Date(fecha).setHours(0, 0, 0, 0);
    return fechaTrabajo < hoy;
  }

  // FUNCIONES DE TECNICOS

  getNombreTecnicoPorId(id: any): string {
    const idNum = Number(id);
    if (!id || isNaN(idNum)) return 'No asignado';
    return (
      this.tecnicosList.find((t) => t.id === idNum)?.nombre || 'No asignado'
    );
  }

  //MODALES

  abrirModalAsignacion(trabajo: Iagenda) {
    this.trabajoSeleccionado = trabajo;
    this.horaInicio = '';
    this.horaFin = '';
    this.fechaTrabajoSeleccionada = this.fechaSeleccionada;

    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('asignarModal')
    );

    modal.show();
  }

  iniciarEdicionDesdeTabla(hora: string, vehiculo: string) {
    const trabajo = this.agendaAsignada[hora][vehiculo];
    if (!trabajo) return;

    this.trabajoSeleccionado = trabajo;
    this.fechaTrabajoSeleccionada = this.formatearFecha(trabajo.age_fecha);

    this.horaInicio = trabajo.age_hora_inicio;
    this.horaFin = trabajo.age_hora_fin;

    this.actualizarHorasFinDisponibles(); // ✅ llamada correcta aquí

    this.vehiculoSeleccionado = trabajo.age_vehiculo;
    this.idTecnico = trabajo.age_tecnico || 0;
    this.edicionHabilitada = !this.esFechaPasada(trabajo.age_fecha);

    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('asignarModal')
    ).show();
  }

  formatearFecha(fecha: string | Date | null | undefined): string {
    if (!fecha) return this.obtenerFechaHoy(); // fallback por si es null
    const f = new Date(fecha);
    const y = f.getFullYear();
    const m = (f.getMonth() + 1).toString().padStart(2, '0');
    const d = f.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  async abrirVistaDetalle(hora: string, vehiculo: string) {
    const trabajo = this.agendaAsignada[hora][vehiculo];

    const sol = await this.agendaService.getInfoSolByAgeId(trabajo!.id);

    if (!trabajo) return;
    this.trabajoVista = trabajo;
    this.solucionVista = sol;

    this.cargarImagenesInstalacion('neg_t_instalaciones', trabajo.ord_ins);

    if (trabajo.age_tipo === 'LOS' || trabajo.age_tipo === 'VISITA') {
      this.cargarImagenesVisita('neg_t_vis', trabajo.age_id_tipo);
    }

    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modalVistaSoporte')
    ).show();
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

  private cargarImagenesVisita(tabla: string, age_id_sop: string): void {
    this.imagenesService.getImagenesByTableAndId(tabla, age_id_sop).subscribe({
      next: (res: any) => {
        if (res?.imagenes) {
          this.imagenesVisita = res.imagenes;
        } else {
          this.imagenesVisita = {};
        }
        console.log(this.imagenesVisita);
      },
      error: (err) => {
        console.error('❌ Error cargando imágenes:', err);
        this.imagenesVisita = {};
      },
    });
  }

  abrirImagenModal(url: string) {
    this.imagenSeleccionada = url;
    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modalImagenAmpliada')!
    );

    modal.show();
  }

  asignarDesdePreagenda(trabajo: Iagenda) {
    this.trabajoSeleccionado = trabajo;
    this.fechaTrabajoSeleccionada = this.fechaSeleccionada;
    this.horaInicio = '';
    this.horaFin = '';
    this.vehiculoSeleccionado = '';
    this.idTecnico = 0;
    this.modoEdicion = false;

    const modalPreagenda = bootstrap.Modal.getInstance(
      document.getElementById('modalSoportes')
    );
    modalPreagenda?.hide();

    setTimeout(() => {
      const modalAsignar = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('asignarModal')
      );

      modalAsignar.show();
    });
  }

  cerrarModalPreagenda() {
    bootstrap.Modal.getInstance(
      document.getElementById('modalSoportes')
    )?.hide();
  }
  horaSeleccionada: string = '';

  actualizarHorasDesdeRango() {
    const [inicio, fin] = this.horaSeleccionada.split(' - ');
    this.horaInicio = inicio;
    this.horaFin = fin;
  }

  horariosDisponiblesFin: string[] = [];

  actualizarHorasFinDisponibles() {
    const indexInicio = this.horarios.findIndex(
      (h) => h.split(' - ')[0] === this.horaInicio
    );
    this.horariosDisponiblesFin = [];

    if (indexInicio !== -1) {
      for (let i = indexInicio + 1; i < this.horarios.length; i++) {
        const horaFin = this.horarios[i].split(' - ')[1];
        this.horariosDisponiblesFin.push(horaFin);
      }
    }
  }

  hayConflictoDeHorario(): boolean {
    if (!this.horaInicio || !this.horaFin || !this.vehiculoSeleccionado)
      return false;

    const inicioSeleccionado = this.horaInicio;
    const finSeleccionado = this.horaFin;
    const vehiculo = this.vehiculoSeleccionado;

    for (const hora of this.horarios) {
      const [hInicio, hFin] = hora.split(' - ');

      const estaDentroDelRango =
        hInicio >= inicioSeleccionado && hInicio < finSeleccionado;

      const trabajoEnCelda = this.agendaAsignada[hora][vehiculo];
      const esTrabajoActual =
        trabajoEnCelda?.id === this.trabajoSeleccionado?.id;

      if (estaDentroDelRango && trabajoEnCelda && !esTrabajoActual) {
        return true; // conflicto solo si ya hay otro trabajo en este vehículo y horario
      }
    }

    return false;
  }

  esImagenValida(campo: string): boolean {
    const img = this.imagenesInstalacion[campo];
    return img && img.ruta !== 'null' && img.url !== 'undefined/imagenes/null';
  }
}
