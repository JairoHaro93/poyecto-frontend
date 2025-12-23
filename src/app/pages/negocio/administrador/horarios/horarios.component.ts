// src/app/pages/…/horarios/horarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { DepartamentosService } from '../../../../services/sistema/departamentos.service';
import {
  TurnosService,
  ITurnoDiario,
} from '../../../../services/negocio_latacunga/turnos.service';
import { ReporteAsistenciaService } from '../../../../services/negocio_latacunga/reporte-asistencia.service';

import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { IDepartamento } from '../../../../interfaces/sistema/idepartamento.interface';

import { SwalStd } from '../../../../utils/swal.std';

// ===== Interfaces UI =====
interface UsuarioResumen {
  id: number;
  nombre_completo: string;
}
interface DiaColumna {
  fecha: string; // YYYY-MM-DD
  etiqueta: string; // 'Lun 18'
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

  // ✅ Semana completa (Lun-Dom)
  semanaISO: string | null = null; // YYYY-Www (input type="week")
  semanaInicio: string | null = null; // YYYY-MM-DD (lunes)
  semanaFin: string | null = null; // YYYY-MM-DD (domingo)
  diasVentana: DiaColumna[] = [];

  jefeActual?: Iusuarios;

  departamentosSucursal: IDepartamento[] = [];
  departamentoSeleccionadoId: number | null = null;

  usuariosEquipo: UsuarioResumen[] = [];
  cargandoUsuarios = false;

  turnos: ITurnoDiario[] = [];
  turnosPorUsuario = new Map<number, Map<string, ITurnoDiario>>();
  cargandoTurnos = false;

  filtroTextoUsuario = '';

  // ==========================
  //   MODAL DETALLE
  // ==========================
  detalleVisible = false;
  detalleUsuario?: UsuarioResumen;
  detalleFecha?: string;
  detalleTurno?: ITurnoDiario;

  // ==========================
  //   REPORTE EXCEL (POR MES)
  // ==========================
  reporteUsuarioId: number | null = null;
  reporteMes: string | null = null; // YYYY-MM
  generandoReporte = false;

  // ==========================
  //   HORA ACUMULADA (APROBAR/RECHAZAR)
  // ==========================
  procesandoHoraAcumulada = false;

  constructor(
    private authService: AutenticacionService,
    private usuariosService: UsuariosService,
    private departamentosService: DepartamentosService,
    private turnosService: TurnosService,
    private reporteAsistenciaService: ReporteAsistenciaService
  ) {}

  // ==========================
  //   GETTERS
  // ==========================
  get esJefeSucursal(): boolean {
    return !!this.jefeActual?.sucursal_id && !this.jefeActual?.departamento_id;
  }

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
    return this.diasVentana.length; // siempre 7
  }

  // ==========================
  //   INIT
  // ==========================
  async ngOnInit(): Promise<void> {
    try {
      this.jefeActual = await this.authService.getUsuarioAutenticado();

      if (this.jefeActual) {
        this.filtroSucursal =
          this.jefeActual.sucursal_nombre ||
          this.jefeActual.sucursal_codigo ||
          null;
      }

      if (this.esJefeSucursal && this.jefeActual?.sucursal_id) {
        await this.cargarDepartamentosSucursal(this.jefeActual.sucursal_id);
      }

      // ✅ Semana actual (Lun-Dom)
      this.setSemanaActual();

      // ✅ Reporte: mes actual
      this.reporteMes = this.formatMes(new Date());

      await this.cargarUsuariosEquipo();
      await this.buscarTurnos();
    } catch (e: any) {
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'Error cargando horarios'
      );
    }
  }

  // ==========================
  //   FECHAS (SEMANA LUN-DOM)
  // ==========================
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

  private formatMes(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  /**
   * Devuelve el lunes de la semana (si es domingo, retrocede 6 días)
   */
  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0 dom, 1 lun, ..., 6 sáb
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private buildDiasSemana(monday: Date): DiaColumna[] {
    const nombresDia = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const out: DiaColumna[] = [];
    const tmp = new Date(monday);

    for (let i = 0; i < 7; i++) {
      const fechaStr = this.formatFecha(tmp);
      const etiqueta = `${nombresDia[tmp.getDay()]} ${String(
        tmp.getDate()
      ).padStart(2, '0')}`;
      out.push({ fecha: fechaStr, etiqueta });
      tmp.setDate(tmp.getDate() + 1);
    }
    return out;
  }

  /**
   * Convierte un Date a string ISO week: YYYY-Www
   */
  private toISOWeekString(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    // ISO: jueves determina el año
    const day = (d.getDay() + 6) % 7; // lun=0..dom=6
    d.setDate(d.getDate() - day + 3); // mover a jueves

    const firstThursday = new Date(d.getFullYear(), 0, 4);
    const firstDay = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstDay + 3);

    const week =
      1 + Math.round((d.getTime() - firstThursday.getTime()) / 604800000);
    const year = d.getFullYear();
    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  /**
   * ISO week (YYYY-Www) -> lunes de esa semana
   */
  private isoWeekToMonday(iso: string | null): Date | null {
    if (!iso) return null;
    const m = /^(\d{4})-W(\d{2})$/.exec(iso);
    if (!m) return null;

    const year = Number(m[1]);
    const week = Number(m[2]);
    if (!year || !week) return null;

    // ISO week 1 = semana que contiene el 4 de enero
    const jan4 = new Date(year, 0, 4);
    const week1Monday = this.getMonday(jan4);

    const monday = new Date(week1Monday);
    monday.setDate(week1Monday.getDate() + (week - 1) * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private setSemanaFromDate(base: Date): void {
    const monday = this.getMonday(base);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    this.semanaInicio = this.formatFecha(monday);
    this.semanaFin = this.formatFecha(sunday);

    this.diasVentana = this.buildDiasSemana(monday);
    this.semanaISO = this.toISOWeekString(monday);
  }

  private setSemanaActual(): void {
    this.setSemanaFromDate(new Date());
  }

  async onCambioSemanaISO(value: string | null): Promise<void> {
    this.semanaISO = value;
    const monday = this.isoWeekToMonday(value);
    if (!monday) return;

    this.setSemanaFromDate(monday);
    await this.buscarTurnos();
  }

  async semanaAnterior(): Promise<void> {
    const base = this.parseFecha(this.semanaInicio);
    if (!base) return;
    base.setDate(base.getDate() - 7);
    this.setSemanaFromDate(base);
    await this.buscarTurnos();
  }

  async semanaSiguiente(): Promise<void> {
    const base = this.parseFecha(this.semanaInicio);
    if (!base) return;
    base.setDate(base.getDate() + 7);
    this.setSemanaFromDate(base);
    await this.buscarTurnos();
  }

  async semanaActual(): Promise<void> {
    this.setSemanaActual();
    await this.buscarTurnos();
  }

  // ==========================
  //   DEPARTAMENTOS / USUARIOS
  // ==========================
  private async cargarDepartamentosSucursal(sucursalId: number): Promise<void> {
    try {
      const todos = await this.departamentosService.getAll();
      this.departamentosSucursal = (todos || []).filter(
        (d) => d.sucursal_id === sucursalId
      );
    } catch (e: any) {
      this.departamentosSucursal = [];
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'Error cargando departamentos'
      );
    }
  }

  private async cargarUsuariosEquipo(): Promise<void> {
    this.cargandoUsuarios = true;
    try {
      if (!this.jefeActual) {
        this.usuariosEquipo = [];
        return;
      }

      let departamentoIdFiltro: number | undefined;

      if (this.esJefeSucursal) {
        if (!this.departamentoSeleccionadoId) {
          this.usuariosEquipo = [];
          return;
        }
        departamentoIdFiltro = this.departamentoSeleccionadoId;
      }

      const lista = await this.usuariosService.getParaTurnos(
        departamentoIdFiltro
      );

      this.usuariosEquipo = (lista || [])
        .map((u: Iusuarios) => ({
          id: Number(u.id),
          nombre_completo: `${u.nombre} ${u.apellido}`.trim(),
        }))
        .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
    } catch (e: any) {
      this.usuariosEquipo = [];
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'Error cargando usuarios'
      );
    } finally {
      this.cargandoUsuarios = false;
    }
  }

  async onCambioDepartamento(): Promise<void> {
    this.reporteUsuarioId = null;
    await this.cargarUsuariosEquipo();
    await this.buscarTurnos();
  }

  // ==========================
  //   TURNOS (consulta por semana Lun-Dom)
  // ==========================
  private async buscarTurnos(): Promise<void> {
    if (!this.filtroSucursal || !this.semanaInicio || !this.semanaFin) {
      this.turnos = [];
      this.turnosPorUsuario.clear();
      return;
    }

    if (this.esJefeSucursal && !this.departamentoSeleccionadoId) {
      this.turnos = [];
      this.turnosPorUsuario.clear();
      return;
    }

    this.cargandoTurnos = true;
    try {
      const turnos = await this.turnosService.listarTurnos({
        sucursal: this.filtroSucursal,
        fecha_desde: this.semanaInicio, // lunes
        fecha_hasta: this.semanaFin, // domingo
      });

      const idsEquipo = new Set(this.usuariosEquipo.map((u) => u.id));
      this.turnos = (turnos || []).filter((t) =>
        idsEquipo.has(Number(t.usuario_id))
      );

      this.buildTurnosIndex();
    } catch (e: any) {
      this.turnos = [];
      this.turnosPorUsuario.clear();
      await SwalStd.error(SwalStd.getErrorMessage(e), 'Error buscando turnos');
    } finally {
      this.cargandoTurnos = false;
    }
  }

  private buildTurnosIndex(): void {
    this.turnosPorUsuario = new Map<number, Map<string, ITurnoDiario>>();

    for (const t of this.turnos) {
      const uid = Number(t.usuario_id);
      const fechaRaw = (t as any).fecha as string | undefined;
      if (!fechaRaw) continue;
      const fechaClave = fechaRaw.slice(0, 10);

      if (!this.turnosPorUsuario.has(uid)) {
        this.turnosPorUsuario.set(uid, new Map<string, ITurnoDiario>());
      }
      this.turnosPorUsuario.get(uid)!.set(fechaClave, t);
    }
  }

  getTurno(usuarioId: number, fecha: string): ITurnoDiario | undefined {
    return this.turnosPorUsuario.get(usuarioId)?.get(fecha);
  }

  // ==========================
  //   UI
  // ==========================
  private startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  esHoy(fecha: string): boolean {
    return fecha === this.formatFecha(new Date());
  }

  esDiaPasado(fecha: string): boolean {
    const d = this.parseFecha(fecha);
    if (!d) return false;
    return this.startOfDay(d).getTime() < this.startOfDay(new Date()).getTime();
  }

  esDiaFuturo(fecha: string): boolean {
    const d = this.parseFecha(fecha);
    if (!d) return false;
    return this.startOfDay(d).getTime() > this.startOfDay(new Date()).getTime();
  }

  estadoUI(turno?: ITurnoDiario, fecha?: string): string {
    if (!turno) return 'SIN TURNO';

    // ✅ PRIORIDAD: tipo_dia (DEVOLUCIÓN/VACACIONES/PERMISO)
    if (this.esDiaNoLaboral(turno)) {
      return this.tipoDiaLabel(turno);
    }

    if (!fecha)
      return String(turno.estado_asistencia || 'PROGRAMADO').toUpperCase();

    const isToday = this.esHoy(fecha);
    const isPast = this.esDiaPasado(fecha);
    const isFuture = this.esDiaFuturo(fecha);

    const base = String(turno.estado_asistencia || 'SIN_MARCA')
      .toUpperCase()
      .trim();

    const entReal = (turno as any).hora_entrada_real;
    const salReal = (turno as any).hora_salida_real;

    const tieneEntrada = !!entReal;
    const tieneSalida = !!salReal;

    if (isToday) {
      if (tieneEntrada && !tieneSalida) return 'EN CURSO';
      if (base === 'SIN_MARCA') return 'SIN MARCA';
      if (base === 'SOLO_ENTRADA') return 'SOLO ENTRADA';
      if (base === 'SOLO_SALIDA') return 'SOLO SALIDA';
      if (base === 'ATRASO') return 'ATRASO';
      if (base === 'INCOMPLETO') return 'INCOMPLETO';
      if (base === 'COMPLETO' || base === 'OK') return 'COMPLETO';
      return 'PROGRAMADO';
    }

    if (isPast) {
      if (tieneEntrada && !tieneSalida) return 'SOLO ENTRADA';
      if (!tieneEntrada && tieneSalida) return 'SOLO SALIDA';

      if (base === 'SIN_MARCA') return 'FALTA';
      if (base === 'COMPLETO' || base === 'OK') return 'COMPLETO';
      if (base === 'SOLO_ENTRADA') return 'SOLO ENTRADA';
      if (base === 'SOLO_SALIDA') return 'SOLO SALIDA';
      return base.replace(/_/g, ' ');
    }

    if (isFuture) return 'PROGRAMADO';
    return base.replace(/_/g, ' ');
  }

  estadoClassUI(turno?: ITurnoDiario, fecha?: string): string {
    const st = this.estadoUI(turno, fecha);
    switch (st) {
      case 'DEVOLUCIÓN':
        return 'estado-devolucion';
      case 'VACACIONES':
        return 'estado-vacaciones';
      case 'PERMISO':
        return 'estado-permiso';

      case 'SIN TURNO':
        return 'estado-sin-turno';
      case 'PROGRAMADO':
        return 'estado-programado';
      case 'EN CURSO':
        return 'estado-en-curso';
      case 'COMPLETO':
        return 'estado-completo';
      case 'ATRASO':
        return 'estado-atraso';
      case 'INCOMPLETO':
        return 'estado-incompleto';
      case 'FALTA':
        return 'estado-falta';
      case 'SIN MARCA':
        return 'estado-sin-marca';
      case 'SOLO ENTRADA':
      case 'SOLO SALIDA':
        return 'estado-parcial';
      default:
        return 'estado-desconocido';
    }
  }

  onClickCelda(usuario: UsuarioResumen, fecha: string): void {
    const turno = this.getTurno(usuario.id, fecha);
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

  // ==========================
  //   FORMATOS
  // ==========================
  private formatHora(valor: any): string | null {
    if (valor === null || valor === undefined) return null;

    if (valor instanceof Date) return valor.toTimeString().slice(0, 5);

    const s = String(valor).trim();
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toTimeString().slice(0, 5);

    const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(s);
    if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;

    return null;
  }

  rangoHorario(turno?: ITurnoDiario): string {
    if (!turno) return '';
    const ent = this.formatHora(turno.hora_entrada_prog);
    const sal = this.formatHora(turno.hora_salida_prog);
    return `${ent || '--:--'} - ${sal || '--:--'}`;
  }

  asistenciaResumen(turno?: ITurnoDiario): string {
    if (!turno) return '';
    const ent = this.formatHora((turno as any).hora_entrada_real);
    const sal = this.formatHora((turno as any).hora_salida_real);
    if (!ent && !sal) return '';
    return `E ${ent || '--:--'} / S ${sal || '--:--'}`;
  }

  fechaLarga(fechaStr: string | null | undefined): string {
    if (!fechaStr) return '';
    const d = new Date(fechaStr + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return String(fechaStr);
    return d.toLocaleDateString('es-EC', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // ==========================
  //   REPORTE EXCEL (MES)
  // ==========================
  puedeGenerarReporte(): boolean {
    const mesOk = !!this.reporteMes && /^\d{4}-\d{2}$/.test(this.reporteMes);
    return !!this.reporteUsuarioId && mesOk;
  }

  private getFileNameFromHeaders(headers: any): string | null {
    const disposition =
      headers.get('Content-Disposition') ||
      headers.get('content-disposition') ||
      '';

    const matchStar = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(disposition);
    if (matchStar?.[1]) return decodeURIComponent(matchStar[1].trim());

    const match = /filename="?([^"]+)"?/i.exec(disposition);
    if (match?.[1]) return match[1].trim();

    return null;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  }

  async onGenerarReporte(): Promise<void> {
    if (!this.puedeGenerarReporte()) {
      await SwalStd.warn('Selecciona colaborador y un mes válido (YYYY-MM).');
      return;
    }

    this.generandoReporte = true;

    try {
      const resp = await this.reporteAsistenciaService.descargarReporteExcelMes(
        {
          mes: this.reporteMes!,
          usuario_id: this.reporteUsuarioId!,
        }
      );

      const blob = resp.body;
      if (!blob) throw new Error('Respuesta vacía del servidor');

      const fileName =
        this.getFileNameFromHeaders(resp.headers) || 'reporte.xlsx';
      this.downloadBlob(blob, fileName);

      this.reporteUsuarioId = null;
      //await SwalStd.success('Reporte descargado correctamente');
    } catch (e: any) {
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'Error generando reporte'
      );
    } finally {
      this.generandoReporte = false;
    }
  }

  // ==========================
  //   HORAS ACUMULADAS
  // ==========================
  horaAcumuladaVisible(turno?: ITurnoDiario): boolean {
    if (!turno) return false;
    const st = String((turno as any).estado_hora_acumulada || 'NO')
      .toUpperCase()
      .trim();
    return st !== 'NO' && st !== '';
  }

  horaAcumuladaLabel(turno?: ITurnoDiario): string {
    if (!turno) return '';
    const st = String((turno as any).estado_hora_acumulada || 'NO')
      .toUpperCase()
      .trim();

    if (st === 'NO' || st === '') return '';

    const h = (turno as any).num_horas_acumuladas;
    const hTxt = h ? ` · ${h}h` : '';

    if (st === 'SOLICITUD') return `SOLICITUD${hTxt}`;
    if (st === 'APROBADO') return `APROBADO${hTxt}`;
    if (st === 'RECHAZADO') return `RECHAZADO${hTxt}`;
    return `${st}${hTxt}`;
  }

  horaAcumuladaBadgeClass(turno?: ITurnoDiario): any {
    const st = String((turno as any)?.estado_hora_acumulada || 'NO')
      .toUpperCase()
      .trim();
    return {
      'badge-ha-sol': st === 'SOLICITUD',
      'badge-ha-ok': st === 'APROBADO',
      'badge-ha-rech': st === 'RECHAZADO',
    };
  }

  puedeGestionarHoraAcumulada(turno?: ITurnoDiario): boolean {
    if (!turno) return false;
    const st = String((turno as any).estado_hora_acumulada || 'NO')
      .toUpperCase()
      .trim();
    const esJefe = this.esJefeSucursal || this.esJefeDepartamento;
    return esJefe && st === 'SOLICITUD';
  }

  async onAprobarHoraAcumulada(): Promise<void> {
    if (
      !this.detalleTurno ||
      !this.puedeGestionarHoraAcumulada(this.detalleTurno)
    )
      return;

    const ok = await SwalStd.confirm({
      title: '¿Aprobar solicitud?',
      text: 'Esta acción aprobará las horas acumuladas del turno.',
      confirmText: 'Aprobar',
    });
    if (!ok) return;

    this.procesandoHoraAcumulada = true;
    try {
      await this.turnosService.actualizarEstadoHoraAcumulada(
        this.detalleTurno.id,
        'APROBADO'
      );

      await this.buscarTurnos();
      this.detalleTurno =
        this.getTurno(
          Number(this.detalleTurno.usuario_id),
          this.detalleFecha!
        ) || this.detalleTurno;

      await SwalStd.success('Horas acumuladas aprobadas');
    } catch (e: any) {
      await SwalStd.error(SwalStd.getErrorMessage(e), 'Error aprobando');
    } finally {
      this.procesandoHoraAcumulada = false;
    }
  }

  async onRechazarHoraAcumulada(): Promise<void> {
    if (
      !this.detalleTurno ||
      !this.puedeGestionarHoraAcumulada(this.detalleTurno)
    )
      return;

    const ok = await SwalStd.confirm({
      title: '¿Rechazar solicitud?',
      text: 'Esta acción rechazará las horas acumuladas del turno.',
      confirmText: 'Rechazar',
    });
    if (!ok) return;

    this.procesandoHoraAcumulada = true;
    try {
      await this.turnosService.actualizarEstadoHoraAcumulada(
        this.detalleTurno.id,
        'RECHAZADO'
      );

      await this.buscarTurnos();
      this.detalleTurno =
        this.getTurno(
          Number(this.detalleTurno.usuario_id),
          this.detalleFecha!
        ) || this.detalleTurno;

      await SwalStd.success('Horas acumuladas rechazadas');
    } catch (e: any) {
      await SwalStd.error(SwalStd.getErrorMessage(e), 'Error rechazando');
    } finally {
      this.procesandoHoraAcumulada = false;
    }
  }

  private getTipoDia(turno?: ITurnoDiario): string {
    const td = String((turno as any)?.tipo_dia || 'NORMAL')
      .toUpperCase()
      .trim();
    return td || 'NORMAL';
  }

  tipoDiaLabel(turno?: ITurnoDiario): string {
    const td = this.getTipoDia(turno);
    if (td === 'DEVOLUCION') return 'DEVOLUCIÓN';
    if (td === 'VACACIONES') return 'VACACIONES';
    if (td === 'PERMISO') return 'PERMISO';
    return 'NORMAL';
  }

  esDiaNoLaboral(turno?: ITurnoDiario): boolean {
    const td = this.getTipoDia(turno);
    return td !== 'NORMAL';
  }
}
