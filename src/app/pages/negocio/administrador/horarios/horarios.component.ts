// src/app/pages/…/horarios/horarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { DepartamentosService } from '../../../../services/sistema/departamentos.service';
import {
  TurnosService,
  ITurnoDiario,
} from '../../../../services/negocio_latacunga/turnos.service';

import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { IDepartamento } from '../../../../interfaces/sistema/idepartamento.interface';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

import { ReporteAsistenciaService } from '../../../../services/negocio_latacunga/reporte-asistencia.service';

// interfaces que usaremos
interface UsuarioResumen {
  id: number;
  nombre_completo: string;
}

interface TurnoDiario {
  id: number;
  usuario_id: number;
  fecha: string; // vendrá tipo '2025-12-10T00:00:00.000Z' o '2025-12-10'
  sucursal: string | null;
  hora_entrada_prog: string | null;
  hora_salida_prog: string | null;
  hora_entrada_real: string | null;
  hora_salida_real: string | null;
  min_trabajados: number | null;
  min_atraso: number | null;
  min_extra: number | null;
  estado_asistencia: string | null;
}

interface DiaColumna {
  fecha: string; // 'YYYY-MM-DD'
  etiqueta: string; // 'Jue 12'
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.css',
})
export class HorariosComponent implements OnInit {
  // ==========================
  //   FILTROS / CONTEXTO
  // ==========================

  filtroSucursal: string | null = null;
  fechaDesde: string | null = null; // 'YYYY-MM-DD'
  fechaHasta: string | null = null;

  diasVentana: DiaColumna[] = [];

  jefeActual?: Iusuarios;

  departamentosSucursal: IDepartamento[] = [];
  departamentoSeleccionadoId: number | null = null;

  usuariosEquipo: UsuarioResumen[] = [];
  cargandoUsuarios = false;

  // Turnos del rango (filtrados por equipo)
  turnos: ITurnoDiario[] = [];
  turnosPorUsuario = new Map<number, Map<string, ITurnoDiario>>();
  cargandoTurnos = false;

  filtroTextoUsuario = '';

  // ==========================
  //   MODAL DETALLE TURNO
  // ==========================
  detalleVisible = false;
  detalleUsuario?: UsuarioResumen;
  detalleFecha?: string;
  detalleTurno?: ITurnoDiario;

  // ==========================
  //   REPORETE ASISTENCIA
  // ==========================

  // colaborador seleccionado para el reporte
  reporteUsuarioId: number | null = null;

  // rango del reporte (independiente del rango visual)
  reporteFechaDesde: string | null = null;
  reporteFechaHasta: string | null = null;
  reporteDiasTotales = 0;

  generandoReporte = false;

  constructor(
    private authService: AutenticacionService,
    private usuariosService: UsuariosService,
    private departamentosService: DepartamentosService,
    private turnosService: TurnosService,
    private reporteAsistenciaService: ReporteAsistenciaService // 👈 nuevo
  ) {}

  // ✅ es jefe de sucursal → tiene sucursal pero SIN departamento_id
  get esJefeSucursal(): boolean {
    return !!this.jefeActual?.sucursal_id && !this.jefeActual?.departamento_id;
  }

  // ✅ es jefe de departamento → tiene sucursal y departamento
  get esJefeDepartamento(): boolean {
    return !!this.jefeActual?.sucursal_id && !!this.jefeActual?.departamento_id;
  }

  get usuariosFiltrados(): UsuarioResumen[] {
    const texto = this.filtroTextoUsuario.trim().toLowerCase();
    if (!texto) return this.usuariosEquipo;
    return this.usuariosEquipo.filter((u) =>
      u.nombre_completo.toLowerCase().includes(texto)
    );
  }

  get diasTotales(): number {
    return this.diasVentana.length;
  }

  async ngOnInit(): Promise<void> {
    // 1) Usuario logueado
    this.jefeActual = await this.authService.getUsuarioAutenticado();
    console.log('[HORARIOS] jefeActual:', this.jefeActual);

    // 2) Sucursal fija según jefe
    if (this.jefeActual) {
      this.filtroSucursal =
        this.jefeActual.sucursal_nombre ||
        this.jefeActual.sucursal_codigo ||
        null;
      console.log('[HORARIOS] sucursal fijada:', this.filtroSucursal);
    }

    // 3) Si es jefe de sucursal, cargar departamentos
    if (this.esJefeSucursal && this.jefeActual?.sucursal_id) {
      await this.cargarDepartamentosSucursal(this.jefeActual.sucursal_id);
    }

    // 4) Rango por defecto: 2 días antes / 3 después (vista)
    this.setRangoPorDefecto();

    // 5) Inicializar rango del reporte (por defecto igual al de vista)
    this.reporteFechaDesde = this.fechaDesde;
    this.reporteFechaHasta = this.fechaHasta;
    this.recalcularDiasReporte();

    // 6) Cargar equipo + turnos
    await this.cargarUsuariosEquipo();
    await this.buscarTurnos();
  }

  // ==========================
  //   FECHAS / RANGO (VISTA)
  // ==========================

  private setRangoPorDefecto(): void {
    const hoy = new Date();
    const dDesde = new Date(hoy);
    dDesde.setDate(hoy.getDate() - 2);
    const dHasta = new Date(hoy);
    dHasta.setDate(hoy.getDate() + 3);

    this.fechaDesde = this.formatFecha(dDesde);
    this.fechaHasta = this.formatFecha(dHasta);

    this.recalcularDiasVentana();
  }

  private formatFecha(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dia}`;
  }

  private parseFecha(str: string | null): Date | null {
    if (!str) return null;
    const d = new Date(str + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  private recalcularDiasVentana(): void {
    this.diasVentana = [];

    const d1 = this.parseFecha(this.fechaDesde);
    const d2 = this.parseFecha(this.fechaHasta);
    if (!d1 || !d2 || d1 > d2) return;

    const nombresDia = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    let tmp = new Date(d1);
    while (tmp.getTime() <= d2.getTime()) {
      const fechaStr = this.formatFecha(tmp);
      const etiqueta = `${nombresDia[tmp.getDay()]} ${String(
        tmp.getDate()
      ).padStart(2, '0')}`;

      this.diasVentana.push({ fecha: fechaStr, etiqueta });

      tmp.setDate(tmp.getDate() + 1);
    }

    console.log('[HORARIOS] diasVentana:', this.diasVentana);
  }

  private enforceMaxRangoDias(origen: 'desde' | 'hasta'): void {
    const d1 = this.parseFecha(this.fechaDesde);
    const d2 = this.parseFecha(this.fechaHasta);

    // Si falta alguna fecha, solo recalculamos y listo
    if (!d1 || !d2) {
      this.recalcularDiasVentana();
      this.buscarTurnos();
      return;
    }

    let start = d1;
    let end = d2;

    // Asegurar que fechaDesde <= fechaHasta
    if (end < start) {
      if (origen === 'desde') {
        // El usuario movió fechaDesde por encima de fechaHasta → movemos fechaHasta
        this.fechaHasta = this.formatFecha(start);
        end = start;
      } else {
        // El usuario movió fechaHasta por debajo de fechaDesde → movemos fechaDesde
        this.fechaDesde = this.formatFecha(end);
        start = end;
      }
    }

    // Calculamos días inclusivos
    const diffMs = end.getTime() - start.getTime();
    const dias = Math.floor(diffMs / 86400000) + 1; // +1 para incluir ambos extremos

    if (dias > 6) {
      // Hay más de 6 días → recortamos según quién disparó el cambio
      if (origen === 'desde') {
        const nuevaHasta = new Date(start);
        nuevaHasta.setDate(start.getDate() + 5); // 6 días en total
        this.fechaHasta = this.formatFecha(nuevaHasta);
        console.warn(
          '[HORARIOS] Rango máximo 6 días: ajustando fechaHasta a',
          this.fechaHasta
        );
      } else {
        const nuevaDesde = new Date(end);
        nuevaDesde.setDate(end.getDate() - 5);
        this.fechaDesde = this.formatFecha(nuevaDesde);
        console.warn(
          '[HORARIOS] Rango máximo 6 días: ajustando fechaDesde a',
          this.fechaDesde
        );
      }
    }

    // Recalcular ventana y volver a buscar turnos con el rango corregido
    this.recalcularDiasVentana();
    this.buscarTurnos();
  }

  onCambioFechaDesde(value: string | null): void {
    this.fechaDesde = value;
    this.enforceMaxRangoDias('desde');
  }

  onCambioFechaHasta(value: string | null): void {
    this.fechaHasta = value;
    this.enforceMaxRangoDias('hasta');
  }

  // ==========================
  //   RANGO REPORTE (MÁX. 31 DÍAS)
  // ==========================

  private recalcularDiasReporte(): void {
    const d1 = this.parseFecha(this.reporteFechaDesde);
    const d2 = this.parseFecha(this.reporteFechaHasta);

    if (!d1 || !d2 || d1 > d2) {
      this.reporteDiasTotales = 0;
      return;
    }

    const diffMs = d2.getTime() - d1.getTime();
    this.reporteDiasTotales = Math.floor(diffMs / 86400000) + 1;
  }

  private enforceMaxRangoReporte(origen: 'desde' | 'hasta'): void {
    const d1 = this.parseFecha(this.reporteFechaDesde);
    const d2 = this.parseFecha(this.reporteFechaHasta);

    if (!d1 || !d2) {
      this.recalcularDiasReporte();
      return;
    }

    let start = d1;
    let end = d2;

    // asegurar orden
    if (end < start) {
      if (origen === 'desde') {
        this.reporteFechaHasta = this.formatFecha(start);
        end = start;
      } else {
        this.reporteFechaDesde = this.formatFecha(end);
        start = end;
      }
    }

    const diffMs = end.getTime() - start.getTime();
    const dias = Math.floor(diffMs / 86400000) + 1;

    if (dias > 31) {
      if (origen === 'desde') {
        const nuevaHasta = new Date(start);
        nuevaHasta.setDate(start.getDate() + 30); // 31 días
        this.reporteFechaHasta = this.formatFecha(nuevaHasta);
        console.warn(
          '[HORARIOS] Rango máximo 31 días (reporte): ajustando reporteFechaHasta a',
          this.reporteFechaHasta
        );
      } else {
        const nuevaDesde = new Date(end);
        nuevaDesde.setDate(end.getDate() - 30);
        this.reporteFechaDesde = this.formatFecha(nuevaDesde);
        console.warn(
          '[HORARIOS] Rango máximo 31 días (reporte): ajustando reporteFechaDesde a',
          this.reporteFechaDesde
        );
      }
    }

    this.recalcularDiasReporte();
  }

  onCambioFechaDesdeReporte(value: string | null): void {
    this.reporteFechaDesde = value;
    this.enforceMaxRangoReporte('desde');
  }

  onCambioFechaHastaReporte(value: string | null): void {
    this.reporteFechaHasta = value;
    this.enforceMaxRangoReporte('hasta');
  }

  puedeGenerarReporte(): boolean {
    return (
      !!this.reporteUsuarioId &&
      !!this.reporteFechaDesde &&
      !!this.reporteFechaHasta &&
      this.reporteDiasTotales > 0 &&
      this.reporteDiasTotales <= 31
    );
  }

  private getDepartamentoIdParaReporte(): number | null {
    if (this.esJefeSucursal) {
      return this.departamentoSeleccionadoId ?? null;
    }
    if (this.esJefeDepartamento && this.jefeActual?.departamento_id) {
      return Number(this.jefeActual.departamento_id);
    }
    return null;
  }

  // ==========================
  //   DEPARTAMENTOS (JEFE SUC)
  // ==========================

  private async cargarDepartamentosSucursal(sucursalId: number): Promise<void> {
    try {
      const todos = await this.departamentosService.getAll();
      // Usamos lo mismo que en TurnosComponent: departamentos de esa sucursal
      this.departamentosSucursal = (todos || []).filter(
        (d) => d.sucursal_id === sucursalId
      );
      console.log(
        '[HORARIOS] Departamentos de la sucursal:',
        this.departamentosSucursal
      );
    } catch (error) {
      console.error('❌ Error cargando departamentos de sucursal:', error);
      this.departamentosSucursal = [];
    }
  }

  // ==========================
  //   USUARIOS DEL EQUIPO
  // ==========================

  private async cargarUsuariosEquipo(): Promise<void> {
    this.cargandoUsuarios = true;
    try {
      if (!this.jefeActual) {
        this.usuariosEquipo = [];
        return;
      }

      let departamentoIdFiltro: number | undefined;

      // Jefe de sucursal: trabaja sobre el departamento seleccionado
      if (this.esJefeSucursal) {
        if (!this.departamentoSeleccionadoId) {
          this.usuariosEquipo = [];
          return;
        }
        departamentoIdFiltro = this.departamentoSeleccionadoId;
      }

      // Jefe de departamento: backend ya filtra por su departamento hijo
      // según la lógica de jerarquía que pusimos en selectUsuariosParaTurnos
      const lista: Iusuarios[] = await this.usuariosService.getParaTurnos(
        departamentoIdFiltro
      );

      console.log('[HORARIOS] Usuarios equipo:', lista);

      this.usuariosEquipo = (lista || [])
        .map((u) => ({
          id: Number(u.id),
          nombre_completo: `${u.nombre} ${u.apellido}`.trim(),
        }))
        .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));

      console.log('[HORARIOS] UsuariosEquipo (resumen):', this.usuariosEquipo);
    } catch (error) {
      console.error('❌ Error cargando usuarios equipo:', error);
      this.usuariosEquipo = [];
    } finally {
      this.cargandoUsuarios = false;
    }
  }

  // ==========================
  //   TURNOS / ASISTENCIAS
  // ==========================

  private async buscarTurnos(): Promise<void> {
    if (!this.filtroSucursal || !this.fechaDesde || !this.fechaHasta) {
      this.turnos = [];
      this.turnosPorUsuario.clear();
      return;
    }

    // Si es jefe de sucursal y aún no elige departamento → nada
    if (this.esJefeSucursal && !this.departamentoSeleccionadoId) {
      this.turnos = [];
      this.turnosPorUsuario.clear();
      return;
    }

    this.cargandoTurnos = true;
    try {
      const turnos = await this.turnosService.listarTurnos({
        sucursal: this.filtroSucursal,
        fecha_desde: this.fechaDesde,
        fecha_hasta: this.fechaHasta,
      });

      console.log('[HORARIOS] Turnos crudos desde backend:', turnos.length);

      const idsEquipo = new Set(this.usuariosEquipo.map((u) => u.id));

      const filtrados = (turnos || []).filter((t) =>
        idsEquipo.has(Number(t.usuario_id))
      );

      this.turnos = filtrados;
      this.buildTurnosIndex();

      console.log('[HORARIOS] Turnos filtrados (equipo):', this.turnos.length);
    } catch (error) {
      console.error('❌ Error buscando turnos:', error);
      this.turnos = [];
      this.turnosPorUsuario.clear();
    } finally {
      this.cargandoTurnos = false;
    }
  }

  private buildTurnosIndex(): void {
    this.turnosPorUsuario = new Map<number, Map<string, ITurnoDiario>>();

    for (const t of this.turnos) {
      const uid = Number(t.usuario_id);

      // fecha viene como string del backend: '2025-12-10' o '2025-12-10T00:00:00.000Z'
      const fechaRaw = (t as any).fecha as string | undefined;
      if (!fechaRaw) {
        console.warn('[HORARIOS] Turno sin fecha:', t);
        continue;
      }

      const fechaClave = fechaRaw.slice(0, 10); // 'YYYY-MM-DD'

      if (!this.turnosPorUsuario.has(uid)) {
        this.turnosPorUsuario.set(uid, new Map<string, ITurnoDiario>());
      }
      this.turnosPorUsuario.get(uid)!.set(fechaClave, t);
    }

    console.log('[HORARIOS] turnosPorUsuario indexado (detalle):');
    for (const [uid, mapaFechas] of this.turnosPorUsuario.entries()) {
      console.log('  usuario', uid, 'fechas:', Array.from(mapaFechas.keys()));
    }
  }

  getTurno(usuarioId: number, fecha: string): ITurnoDiario | undefined {
    return this.turnosPorUsuario.get(usuarioId)?.get(fecha);
  }

  // ==========================
  //   HELPERS DE ESTADO
  // ==========================

  /** Devuelve la clase CSS según el estado de asistencia */
  estadoClass(turno?: ITurnoDiario): string {
    if (!turno) return 'estado-sin-turno';

    const estado = (turno.estado_asistencia || '').toUpperCase();

    switch (estado) {
      case 'COMPLETO':
        return 'estado-completo';
      case 'ATRASO':
        return 'estado-atraso';
      case 'FALTA':
        return 'estado-falta';
      case 'INCOMPLETO':
        return 'estado-incompleto';
      case 'SIN_MARCA':
        return 'estado-programado';
      default:
        return 'estado-desconocido';
    }
  }

  estadoLabel(turno?: ITurnoDiario): string {
    if (!turno) return 'SIN TURNO';

    const estado = (turno.estado_asistencia || '').toUpperCase();
    switch (estado) {
      case 'COMPLETO':
        return 'COMPLETO';
      case 'ATRASO':
        return 'ATRASO';
      case 'FALTA':
        return 'FALTA';
      case 'INCOMPLETO':
        return 'INCOMPLETO';
      case 'SIN_MARCA':
        return 'PROGRAMADO';
      default:
        return 'SIN ESTADO';
    }
  }

  onClickCelda(usuario: UsuarioResumen, fecha: string): void {
    const turno = this.getTurno(usuario.id, fecha);

    // Si quieres que solo abra cuando hay turno, descomenta:
    // if (!turno) return;

    this.detalleUsuario = usuario;
    this.detalleFecha = fecha;
    this.detalleTurno = turno;
    this.detalleVisible = true;
  }

  cerrarDetalleTurno(): void {
    this.detalleVisible = false;
    this.detalleUsuario = undefined;
    this.detalleFecha = undefined;
    this.detalleTurno = undefined;
  }

  esHoy(fecha: string): boolean {
    const hoy = new Date();
    const hoyStr = this.formatFecha(hoy); // ya existe formatFecha
    return fecha === hoyStr;
  }

  /** Formatea una hora a 'HH:MM' si se reconoce, si no, devuelve null */
  private formatHora(valor: any): string | null {
    if (valor === null || valor === undefined) return null;

    // Si viene como Date
    if (valor instanceof Date) {
      return valor.toTimeString().slice(0, 5); // 'HH:MM'
    }

    const s = String(valor).trim();

    // Intentar parsear como fecha/hora ISO
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toTimeString().slice(0, 5); // 'HH:MM'
    }

    // Si viene como HH:MM o HH:MM:SS
    const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(s);
    if (m) {
      return `${m[1].padStart(2, '0')}:${m[2]}`;
    }

    // Si viene como "08.0", "56.0", etc., lo ignoramos
    if (/^\d+(\.\d+)?$/.test(s)) {
      return null;
    }

    return null;
  }

  /** Horario programado “HH:MM - HH:MM” */
  rangoHorario(turno?: ITurnoDiario): string {
    if (!turno) return '';
    const ent = this.formatHora(turno.hora_entrada_prog);
    const sal = this.formatHora(turno.hora_salida_prog);
    return `${ent || '--:--'} - ${sal || '--:--'}`;
  }

  /** Resumen de asistencia real: "E 17:37 / S 19:16" */
  asistenciaResumen(turno?: ITurnoDiario): string {
    if (!turno) return '';

    const ent = this.formatHora((turno as any).hora_entrada_real);
    const sal = this.formatHora((turno as any).hora_salida_real);

    if (!ent && !sal) return '';
    return `E ${ent || '--:--'} / S ${sal || '--:--'}`;
  }

  /** Minutos → texto amigable "1 h 40 min" */
  minutosAHoras(min: number | null | undefined): string {
    if (!min || min <= 0) return '0 min';
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0 && m > 0) return `${h} h ${m} min`;
    if (h > 0) return `${h} h`;
    return `${m} min`;
  }

  /** Fecha larga "Jueves 12/12/2025" */
  fechaLarga(fechaStr: string | null | undefined): string {
    if (!fechaStr) return '';
    const d = new Date(fechaStr + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return fechaStr;
    return d.toLocaleDateString('es-EC', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  async onGenerarReporte(): Promise<void> {
    if (!this.puedeGenerarReporte()) return;

    const departamentoId = this.getDepartamentoIdParaReporte();

    this.generandoReporte = true;
    try {
      const resp = await this.reporteAsistenciaService.descargarReporteExcel({
        fecha_desde: this.reporteFechaDesde!,
        fecha_hasta: this.reporteFechaHasta!,
        usuario_id: this.reporteUsuarioId!,
        departamento_id: departamentoId,
      });

      const blob = resp.body;
      if (!blob) {
        throw new Error('Respuesta vacía del servidor');
      }

      const disposition =
        resp.headers.get('Content-Disposition') ||
        resp.headers.get('content-disposition') ||
        '';
      let fileName = 'reporte.xlsx';

      const match = /filename="?(.*?)"?$/i.exec(disposition);
      if (match && match[1]) {
        fileName = match[1];
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      // 👇 Solo limpiamos el colaborador, el rango queda igual
      this.reporteUsuarioId = null;
      // this.reporteDiasTotales = 0;  ❌ quítalo
    } catch (error: any) {
      console.error('❌ Error descargando reporte:', error);
      alert(error?.error?.message || 'Error al generar / descargar el reporte');
    } finally {
      this.generandoReporte = false;
    }
  }

  async onCambioDepartamento(): Promise<void> {
    console.log(
      '[HORARIOS] Cambio de departamento seleccionado:',
      this.departamentoSeleccionadoId
    );

    // 🔹 Al cambiar de departamento, limpiamos el colaborador del reporte
    this.reporteUsuarioId = null;
    // this.reporteDiasTotales = 0; ❌ quítalo (el rango sigue siendo el mismo)

    await this.cargarUsuariosEquipo();
    await this.buscarTurnos();

    // Opcional, por claridad: recalcular por si acaso
    this.recalcularDiasReporte();
  }
}
