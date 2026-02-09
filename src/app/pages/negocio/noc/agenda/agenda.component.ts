// ==========================
// AGENDA COMPONENT TS (refactor a ImagesService)
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

import { firstValueFrom, tap } from 'rxjs';
import { ImagesService } from '../../../../services/negocio_latacunga/images.service';
import { ImageItem } from '../../../../interfaces/negocio/images/images';

declare var bootstrap: any;

/** Celda renderizada en la grilla de agenda */
type RenderCell = {
  trabajo: Iagenda | null;
  rowspan: number;
  mostrar: boolean;
};

/** Mapa horario → vehículo → celda render */
type RenderAgenda = {
  [hora: string]: { [vehiculo: string]: RenderCell };
};

/** Estructura que espera el template legado para mostrar imágenes */
type LegacyImg = { ruta: string; url: string };

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css',
})
export class AgendaComponent {
  // =========================================================
  // inyección de servicios
  // =========================================================
  private soporteService = inject(SoportesService);
  private clienteService = inject(ClientesService);
  private usuariosService = inject(UsuariosService);
  private agendaService = inject(AgendaService);
  private authService = inject(AutenticacionService);
  private socketService = inject(SoketService);
  private imagesService = inject(ImagesService); // ✅ ÚNICO servicio de imágenes

  // =========================================================
  // estado de datos (listas, caché)
  // =========================================================
  tecnicosList: Iusuarios[] = [];
  agendaList: Iagenda[] = [];
  preAgendaList: Iagenda[] = [];
  private clienteCache = new Map<string, ClienteBatchItem>();

  // =========================================================
  // estado de UI
  // =========================================================
  preAgendaPendientesCount = 0;
  idTecnico = 0;
  fechaTrabajoSeleccionada = '';
  fechaSeleccionada = this.obtenerFechaHoy();
  nombreDelDia = this.obtenerNombreDelDia(this.fechaSeleccionada);
  pendientes: number | null = null;

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
  horaSeleccionada = '';

  horariosDisponiblesFin: string[] = [];

  /** grilla: hora → vehículo → Iagenda|null */
  agendaAsignada: { [hora: string]: { [vehiculo: string]: Iagenda | null } } =
    {};

  /** render final para el template */
  renderAgenda: RenderAgenda = {};

  /** imágenes (ahora vienen del backend nuevo y se adaptan a {url,ruta}) */
  imagenesInstalacion: Record<string, LegacyImg> = {};
  imagenesVisita: Record<string, LegacyImg> = {};

  /** imágenes infraestructura (lista directa del backend nuevo) */
  imagenesInfra: ImageItem[] = [];

  // =========================================================
  // constantes
  // =========================================================
  vehiculos = [
    { codigo: 'R17', nombre: 'R17 FURGONETA' },
    { codigo: 'R18', nombre: 'R18 CAMIONETA' },
    { codigo: 'R19', nombre: 'R19 CAMION' },
    { codigo: 'R20', nombre: 'R20 MOTO ROJA' },
  ];

  // =========================================================
  // ciclo de vida
  // =========================================================
  async ngOnInit() {
    try {
      await this.contarpendientes();
      this.datosUsuario = await this.authService.getUsuarioAutenticado();

      this.generarHorarios();
      await this.cargarAgendaPorFecha();
      await this.cargarPreAgenda();
      this.tecnicosList = await this.usuariosService.getAllAgendaTecnicos();
    } catch {
      // silencio
    } finally {
      this.registrarSockets();
    }
  }

  // =========================================================
  // sockets
  // =========================================================
  private registrarSockets(): void {
    this.socketService.on('trabajoAgendadoNOC', async () => {
      await this.cargarAgendaPorFecha();
      await this.contarpendientes();
    });

    this.socketService.on('trabajoCulminadoNOC', async () => {
      await this.cargarAgendaPorFecha();
      await this.contarpendientes();
    });

    this.socketService.on('trabajoPreagendadoNOC', async () => {
      await this.contarpendientes();
      const anterior = this.preAgendaPendientesCount;
      await this.cargarPreAgenda();
      if (this.preAgendaPendientesCount > anterior) this.reproducirSonido();
    });
  }

  // =========================================================
  // carga de datos (API)
  // =========================================================
  async contarpendientes(): Promise<void> {
    try {
      const r = await this.agendaService.getAgendaPendienteByFecha(
        this.fechaSeleccionada,
      );
      this.pendientes = r.soportes_pendientes;
    } catch (error) {
      console.error('Error al contar pendientes:', error);
    }
  }

  async cargarAgendaPorFecha(): Promise<void> {
    this.contarpendientes(); // informativo

    try {
      this.agendaList = await this.agendaService.getAgendaByDate(
        this.fechaSeleccionada,
      );

      if (typeof (this as any).enrichAgendaListBatch === 'function') {
        this.agendaList = await (this as any).enrichAgendaListBatch(
          this.agendaList,
        );
      }

      // limpiar/armar grilla base
      this.agendaAsignada = {};
      this.horarios.forEach((hora) => {
        this.agendaAsignada[hora] = {};
        this.vehiculos.forEach(
          (v) => (this.agendaAsignada[hora][v.codigo] = null),
        );
      });

      this.mapearAgendaDesdeBD();
      this.generarRenderAgenda();
    } catch (error) {
      console.error('❌ Error al cargar la agenda por fecha:', error);
    }
  }

  async cargarPreAgenda(): Promise<void> {
    try {
      this.preAgendaList = await this.agendaService.getPreAgenda();
      this.preAgendaPendientesCount = this.preAgendaList.length;

      if (typeof (this as any).enrichAgendaListBatch === 'function') {
        this.preAgendaList = await (this as any).enrichAgendaListBatch(
          this.preAgendaList,
        );
      }
    } catch (e) {
      console.error('❌ Error al cargar preagenda:', e);
    } finally {
      this.isReady = true;
    }
  }

  private async enrichAgendaListBatch(lista: Iagenda[]): Promise<Iagenda[]> {
    if (!Array.isArray(lista) || lista.length === 0) return lista;

    const ords = Array.from(
      new Set(
        lista
          .map((it) => String(it?.ord_ins ?? '').trim())
          .filter((v) => v.length > 0),
      ),
    );

    const faltantes = ords.filter((k) => !this.clienteCache.has(k));
    if (faltantes.length > 0) {
      try {
        const resp = await firstValueFrom(
          this.clienteService.getClientesByOrdInsBatch(faltantes),
        );
        for (const row of resp ?? []) {
          this.clienteCache.set(String(row.orden_instalacion), row);
        }
      } catch (e) {
        console.error('❌ Error batch clientes:', e);
      }
    }

    return lista.map((item) => {
      const info = this.clienteCache.get(String(item?.ord_ins ?? ''));
      return {
        ...item,
        nombre_completo: info?.nombre_completo ?? item.nombre_completo ?? '---',
        // @ts-ignore – campos enriquecidos opcionales
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

  // =========================================================
  // visualización: armado de grilla y render
  // =========================================================
  mapearAgendaDesdeBD(): void {
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

  generarRenderAgenda(): void {
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

    // colapsar celdas consecutivas del mismo trabajo por vehículo
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

  // =========================================================
  // acciones: asignación / edición de trabajos
  // =========================================================
  async guardarAsignacionTrabajo(): Promise<void> {
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

    const body: Iagenda = {
      ...this.trabajoSeleccionado!,
      age_fecha: this.fechaTrabajoSeleccionada,
      age_hora_inicio: this.horaInicio,
      age_hora_fin: this.horaFin,
      age_vehiculo: this.vehiculoSeleccionado,
      age_tecnico: this.idTecnico,
    };

    try {
      await this.agendaService.actualizarAgendaHorario(body.id, body);

      this.socketService.emit('trabajoAgendado', { tecnicoId: this.idTecnico });
      this.socketService.emit('trabajoPreagendado');

      // ✅ cerrar panel automáticamente
      this.cerrarAsignarPanel();

      // opcional: limpiar formulario (si quieres)
      this.resetAsignacionForm();

      // ✅ refrescar sin duplicar sockets
      await this.cargarAgendaPorFecha();
      await this.cargarPreAgenda();
      await this.contarpendientes();
    } catch (e) {
      console.error(e);
    }
  }

  private resetAsignacionForm(): void {
    this.trabajoSeleccionado = null;
    this.horaInicio = '';
    this.horaFin = '';
    this.vehiculoSeleccionado = '';
    this.idTecnico = 0;
    this.modoEdicion = false;
    this.edicionHabilitada = true;
  }

  iniciarEdicionDesdeTabla(hora: string, vehiculo: string): void {
    const trabajo = this.agendaAsignada[hora][vehiculo];
    if (!trabajo) return;

    this.trabajoSeleccionado = trabajo;
    this.fechaTrabajoSeleccionada = this.formatearFecha(trabajo.age_fecha);
    this.horaInicio = trabajo.age_hora_inicio;
    this.horaFin = trabajo.age_hora_fin;
    this.actualizarHorasFinDisponibles();
    this.vehiculoSeleccionado = trabajo.age_vehiculo;
    this.idTecnico = trabajo.age_tecnico || 0;
    this.edicionHabilitada = !this.esFechaPasada(trabajo.age_fecha);
    this.modoEdicion = true;

    // ✅ abrir panel (si ya estaba abierto, re-animar)
    this.reAbrirAsignarPanel();
  }

  private reAbrirAsignarPanel(): void {
    if (this.showAsignarPanel) {
      this.showAsignarPanel = false;
      setTimeout(() => (this.showAsignarPanel = true), 0);
    } else {
      this.showAsignarPanel = true;
    }
  }

  abrirModalAsignacion(trabajo: Iagenda): void {
    this.trabajoSeleccionado = trabajo;
    this.horaInicio = '';
    this.horaFin = '';
    this.fechaTrabajoSeleccionada = this.fechaSeleccionada;

    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('asignarModal'),
    ).show();
  }

  asignarDesdePreagenda(trabajo: Iagenda): void {
    this.trabajoSeleccionado = trabajo;
    this.fechaTrabajoSeleccionada = this.fechaSeleccionada;
    this.horaInicio = '';
    this.horaFin = '';
    this.vehiculoSeleccionado = '';
    this.idTecnico = 0;
    this.modoEdicion = false;

    bootstrap.Modal.getInstance(
      document.getElementById('modalSoportes'),
    )?.hide();

    setTimeout(() => {
      bootstrap.Modal.getOrCreateInstance(
        document.getElementById('asignarModal'),
      ).show();
    });
    this.abrirAsignarPanel();
  }

  cerrarModalPreagenda(): void {
    bootstrap.Modal.getInstance(
      document.getElementById('modalSoportes'),
    )?.hide();
  }

  // =========================================================
  // imágenes (TODO migrado a ImagesService)
  // =========================================================
  /**
   * Abre el modal de detalle y carga imágenes según tipo:
   * - INFRAESTRUCTURA → solo infraestructura (nuevo backend)
   * - VISITA/LOS     → visita + instalación (ambas del nuevo backend)
   * - INSTALACION    → solo instalación (nuevo backend)
   */
  async abrirVistaDetalle(hora: string, vehiculo: string): Promise<void> {
    this.imagenesInstalacion = {};
    this.imagenesVisita = {};
    this.imagenesInfra = [];

    const trabajo = this.agendaAsignada[hora][vehiculo];
    if (!trabajo) return;

    const sol = await this.agendaService.getInfoSolByAgeId(trabajo.id);
    this.trabajoVista = trabajo;
    this.solucionVista = sol;

    if (trabajo.age_tipo === 'INFRAESTRUCTURA') {
      // ✅ SOLO infraestructura
      this.imagesService
        .list('infraestructura', trabajo.age_id_tipo)
        .subscribe({
          next: (imgs) => (this.imagenesInfra = imgs ?? []),
          error: () => (this.imagenesInfra = []),
        });
    } else if (
      trabajo.age_tipo === 'VISITA' ||
      trabajo.age_tipo === 'LOS' ||
      trabajo.age_tipo === 'RETIRO' ||
      trabajo.age_tipo === 'MIGRACION' ||
      trabajo.age_tipo === 'TRASLADO EXT'
    ) {
      // ✅ visita + instalación
      this.cargarImagenesVisita(trabajo.id);
      this.cargarImagenesInstalacion(trabajo.ord_ins);
    } else if (trabajo.age_tipo === 'INSTALACION') {
      // ✅ solo instalación
      this.cargarImagenesInstalacion(trabajo.ord_ins);
    }

    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modalVistaSoporte'),
    ).show();
  }

  /**
   * LEGADO (firma mantenida): antes recibía (tabla, ord_ins).
   * Ahora solo usamos `ord_ins` y pedimos al nuevo backend:
   *   GET /api/images/list/instalaciones/:ord_ins
   * Adaptamos a { [campo]: {url,ruta} } para que el template siga igual.
   */
  private cargarImagenesInstalacion(ordIns: string | number): void {
    const id = String(ordIns);
    if (!id) {
      this.imagenesInstalacion = {};
      return;
    }

    this.imagesService.list('instalaciones', id).subscribe({
      next: (items) =>
        (this.imagenesInstalacion = this.adaptInstalacion(items)),
      error: () => (this.imagenesInstalacion = {}),
    });
  }

  /**
   * LEGADO (firma mantenida): antes recibía (tabla, id_vis).
   * Ahora solo usamos `id_vis` y pedimos al nuevo backend:
   *   GET /api/images/list/visitas/:id_vis
   * Adaptamos a { img_1..img_4: {url,ruta} }.
   */
  private cargarImagenesVisita(
    _tabla: string | null,
    id?: number | string,
  ): void;
  private cargarImagenesVisita(id: number | string): void;
  private cargarImagenesVisita(a: any, b?: any): void {
    const idVis = typeof a === 'number' || typeof a === 'string' ? a : b;
    if (idVis == null) {
      this.imagenesVisita = {};
      return;
    }

    this.imagesService.list('visitas', idVis).subscribe({
      next: (items) => (this.imagenesVisita = this.adaptVisita(items)),
      error: () => (this.imagenesVisita = {}),
    });
  }

  /** Adaptador: instalaciones → mapa por `tag` (y `_position` si aplica). */
  /** Instalación: si position es 0 o null → clave base (router, fachada, …);
   * si es > 0 → usar sufijo (router_2, …)
   */
  private adaptInstalacion(
    items: ImageItem[],
  ): Record<string, { url: string; ruta: string }> {
    const map: Record<string, { url: string; ruta: string }> = {};
    for (const it of items ?? []) {
      const base = (it.tag || 'otros').trim();
      const pos = typeof it.position === 'number' ? it.position : 0;
      const url = (it as any).url || ''; // ✅ confiar en la URL del backend

      const key = pos > 0 ? `${base}_${pos}` : base;
      if (!url) continue; // evita “undefined/imagenes/null”
      map[key] = { url, ruta: url };
    }
    return map;
  }

  private adaptVisita(
    items: ImageItem[],
  ): Record<string, { url: string; ruta: string }> {
    const map: Record<string, { url: string; ruta: string }> = {};
    for (const it of items ?? []) {
      const url = (it as any).url || '';
      if (!url) continue;
      const key =
        it.tag === 'img' && typeof it.position === 'number'
          ? `img_${it.position}`
          : it.tag || 'otros';
      map[key] = { url, ruta: url };
    }
    return map;
  }

  /** Ver imagen ampliada. */
  abrirImagenModal(url: string): void {
    this.imagenSeleccionada = url;
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modalImagenAmpliada')!,
    ).show();
  }

  // =========================================================
  // utilidades de UI
  // =========================================================
  reproducirSonido(): void {
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
      case 'INFRAESTRUCTURA':
        return 'bg-infraestructura text-white';
      case 'ALMUERZO':
        return 'bg-almuerzo text-white';
      case 'Cancelado':
        return 'bg-danger text-white';
      default:
        return 'bg-light text-muted';
    }
  }

  getNombreTecnicoPorId(id: any): string {
    const idNum = Number(id);
    if (!id || isNaN(idNum)) return 'No asignado';
    return (
      this.tecnicosList.find((t) => t.id === idNum)?.nombre || 'No asignado'
    );
  }

  abrirModalImagen(url: string): void {
    this.abrirImagenModal(url);
  }

  esImagenValida(campo: string): boolean {
    const img = this.imagenesInstalacion[campo];
    return !!(
      img &&
      img.ruta !== 'null' &&
      img.url !== 'undefined/imagenes/null'
    );
  }

  // + NUEVO (trackBy)
  trackImg = (_: number, img: ImageItem) => img.id ?? img.url;

  // =========================================================
  // fechas / horas
  // =========================================================
  generarHorarios(): void {
    const inicio = 8 * 60;
    const fin = 21 * 60;
    const paso = 15;

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
      this.vehiculos.forEach(
        (v) => (this.agendaAsignada[horaFormateada][v.codigo] = null),
      );
    }
  }

  getFinHora(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const totalMin = h * 60 + m + 30;
    return `${Math.floor(totalMin / 60)
      .toString()
      .padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`;
  }

  alCambiarFecha(): void {
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

  actualizarHorasDesdeRango(): void {
    const [inicio, fin] = this.horaSeleccionada.split(' - ');
    this.horaInicio = inicio;
    this.horaFin = fin;
  }

  actualizarHorasFinDisponibles(): void {
    const indexInicio = this.horarios.findIndex(
      (h) => h.split(' - ')[0] === this.horaInicio,
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
      const estaDentro =
        hInicio >= inicioSeleccionado && hInicio < finSeleccionado;
      const trabajoEnCelda = this.agendaAsignada[hora][vehiculo];
      const esMismoTrabajo =
        trabajoEnCelda?.id === this.trabajoSeleccionado?.id;

      if (estaDentro && trabajoEnCelda && !esMismoTrabajo) return true;
    }
    return false;
  }

  formatearFecha(fecha: string | Date | null | undefined): string {
    if (!fecha) return this.obtenerFechaHoy();
    const f = new Date(fecha);
    const y = f.getFullYear();
    const m = (f.getMonth() + 1).toString().padStart(2, '0');
    const d = f.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // =========================================================
  // utilidades varias
  // =========================================================
  formatIpUrl(ip?: string): string {
    if (!ip) return '#';
    const clean = ip.trim();
    return /^https?:\/\//i.test(clean) ? clean : `http://${clean}`;
  }

  showAsignarPanel = false;

  abrirAsignarPanel() {
    this.showAsignarPanel = true;
  }

  cerrarAsignarPanel() {
    this.showAsignarPanel = false;
  }

  prevDia(): void {
    this.moverDia(-1);
  }

  nextDia(): void {
    this.moverDia(1);
  }

  private moverDia(delta: number): void {
    const [y, m, d] = this.fechaSeleccionada.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + delta);

    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');

    this.fechaSeleccionada = `${yy}-${mm}-${dd}`;
    this.alCambiarFecha(); // ✅ actualiza nombreDelDia y recarga agenda
  }
}
