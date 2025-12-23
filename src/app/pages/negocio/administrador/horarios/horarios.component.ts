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

  fechaDesde: string | null = null; // vista
  fechaHasta: string | null = null;

  private formatMes(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

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
  //   REPORTE EXCEL
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

  private getFileNameFromHeaders(headers: any): string | null {
    const disposition =
      headers.get('Content-Disposition') ||
      headers.get('content-disposition') ||
      '';

    // Soporta filename="x.xlsx" y filename*=UTF-8''x.xlsx
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
    return this.diasVentana.length;
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

      this.setRangoPorDefecto();
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
  //   FECHAS / RANGO VISTA (MÁX 6)
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
  }

  private async enforceMaxRangoDias(origen: 'desde' | 'hasta'): Promise<void> {
    const d1 = this.parseFecha(this.fechaDesde);
    const d2 = this.parseFecha(this.fechaHasta);

    if (!d1 || !d2) {
      this.recalcularDiasVentana();
      await this.buscarTurnos();
      return;
    }

    let start = d1;
    let end = d2;

    if (end < start) {
      if (origen === 'desde') {
        this.fechaHasta = this.formatFecha(start);
        end = start;
      } else {
        this.fechaDesde = this.formatFecha(end);
        start = end;
      }
    }

    const dias = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

    if (dias > 6) {
      if (origen === 'desde') {
        const nuevaHasta = new Date(start);
        nuevaHasta.setDate(start.getDate() + 5);
        this.fechaHasta = this.formatFecha(nuevaHasta);
      } else {
        const nuevaDesde = new Date(end);
        nuevaDesde.setDate(end.getDate() - 5);
        this.fechaDesde = this.formatFecha(nuevaDesde);
      }

      await SwalStd.warn(
        'El rango máximo de la vista es 6 días. Se ajustó automáticamente.'
      );
    }

    this.recalcularDiasVentana();
    await this.buscarTurnos();
  }

  async onCambioFechaDesde(value: string | null): Promise<void> {
    this.fechaDesde = value;
    await this.enforceMaxRangoDias('desde');
  }

  async onCambioFechaHasta(value: string | null): Promise<void> {
    this.fechaHasta = value;
    await this.enforceMaxRangoDias('hasta');
  }

  puedeGenerarReporte(): boolean {
    const mesOk = !!this.reporteMes && /^\d{4}-\d{2}$/.test(this.reporteMes);
    return !!this.reporteUsuarioId && mesOk;
  }

  private getDepartamentoIdParaReporte(): number | null {
    if (this.esJefeSucursal) return this.departamentoSeleccionadoId ?? null;
    if (this.esJefeDepartamento && this.jefeActual?.departamento_id) {
      return Number(this.jefeActual.departamento_id);
    }
    return null;
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
  //   TURNOS
  // ==========================
  private async buscarTurnos(): Promise<void> {
    if (!this.filtroSucursal || !this.fechaDesde || !this.fechaHasta) {
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
        fecha_desde: this.fechaDesde,
        fecha_hasta: this.fechaHasta,
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
  //   UI (IGUAL APP)
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
      return this.tipoDiaLabel(turno); // nunca será FALTA
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

    // ... (de aquí para abajo tu lógica actual tal cual)

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

    if (/^\d+(\.\d+)?$/.test(s)) return null;
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

  minutosAHoras(min: number | null | undefined): string {
    if (!min || min <= 0) return '0 min';
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0 && m > 0) return `${h} h ${m} min`;
    if (h > 0) return `${h} h`;
    return `${m} min`;
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
  //   REPORTE EXCEL
  // ==========================
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

      await SwalStd.success('Reporte descargado correctamente');
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
