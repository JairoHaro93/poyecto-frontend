import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { IDepartamento } from '../../../../interfaces/sistema/idepartamento.interface';
import {
  TurnosService,
  GenerarTurnosPayload,
  ITurnoDiario,
} from '../../../../services/negocio_latacunga/turnos.service';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';

import {
  VacacionesService,
  VacConfig,
  VacPreviewResponse,
  VacAsignacion,
  VacResumenUsuario,
} from '../../../../services/negocio_latacunga/vacaciones.services';

import { SwalStd } from '../../../../utils/swal.std';
import { environment } from '../../../../../environments/environment';

type TipoDia = 'NORMAL' | 'DEVOLUCION' | 'VACACIONES' | 'PERMISO';
type GenerarModo = 'SEMANA' | 'DIA';
type TipoDiaGeneracion = 'NORMAL' | 'CAMPO';
interface UsuarioResumen {
  id: number;
  nombre_completo: string;
  saldo_minutos: number;
}

interface DiaColumna {
  fecha: string; // YYYY-MM-DD
  etiqueta: string; // Lun 12
}

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.css',
})
export class TurnosComponent implements OnInit {
  // ==========================
  //   CONTEXTO / FILTROS
  // ==========================
  sucursales: string[] = ['LATACUNGA', 'COTOPAXI', 'QUITO', 'AMBATO', 'OTRA'];

  filtroSucursal: string | null = null;

  // Vista semanal (Lun-Dom)
  semanaRef: string | null = null;
  semanaInicio: string | null = null;
  semanaFin: string | null = null;

  // rango efectivo de consulta
  fechaDesde: string | null = null;
  fechaHasta: string | null = null;

  diasTotales = 0;
  diasHabiles = 0;
  diasVentana: DiaColumna[] = [];

  // ==========================
  //   USUARIOS
  // ==========================
  usuarios: UsuarioResumen[] = [];
  usuariosSeleccionadosIds: number[] = [];
  cargandoUsuarios = false;
  filtroTextoUsuario = '';

  // ==========================
  //   CONFIG GENERACIÓN
  // ==========================
  horaEntradaProg = '08:00';
  horaSalidaProg = '17:00';
  excluirFinesSemana = true;
  generandoTurnos = false;

  generarModo: GenerarModo = 'SEMANA';
  generarDia: string | null = null;
  tipoDiaGeneracion: TipoDiaGeneracion = 'NORMAL';
  jefeActual?: Iusuarios;

  departamentosControlados: IDepartamento[] = [];
  departamentoSeleccionadoId: number | null = null;

  // ==========================
  //   TURNOS EXISTENTES
  // ==========================
  turnos: (ITurnoDiario & { tipo_dia?: TipoDia })[] = [];
  turnosPorUsuario = new Map<
    number,
    Map<string, ITurnoDiario & { tipo_dia?: TipoDia }>
  >();
  cargandoTurnos = false;

  savingTurno: Record<number, boolean> = {};

  // ==========================
  //   VACACIONES
  // ==========================
  vacConfig?: VacConfig;

  vacUsuarioId: number | null = null;
  vacFechaDesde: string | null = null;
  vacFechaHasta: string | null = null;
  vacObservacion = '';

  vacResumen?: VacResumenUsuario;
  vacPreview?: VacPreviewResponse;

  vacHistorial: VacAsignacion[] = [];
  cargandoVac = false;
  creandoVac = false;
  anulandoVac: Record<number, boolean> = {};

  constructor(
    private usuariosService: UsuariosService,
    private turnosService: TurnosService,
    private authService: AutenticacionService,
    private vacacionesService: VacacionesService,
  ) {}

  get diasAplicanSemana(): number {
    return this.excluirFinesSemana ? this.diasHabiles : this.diasTotales;
  }

  get debeElegirDepartamento(): boolean {
    return this.departamentosControlados.length > 1;
  }

  get diasAplicanGeneracion(): number {
    if (this.generarModo === 'DIA') {
      const d = this.parseFecha(this.generarDia);
      if (!d) return 0;

      if (this.excluirFinesSemana) {
        const dow = d.getDay();
        if (dow === 0 || dow === 6) return 0;
      }
      return 1;
    }

    return this.diasAplicanSemana;
  }

  get usuariosFiltrados(): UsuarioResumen[] {
    const texto = this.filtroTextoUsuario.trim().toLowerCase();
    if (!texto) return this.usuarios;

    return this.usuarios.filter((u) =>
      u.nombre_completo.toLowerCase().includes(texto),
    );
  }

  async ngOnInit(): Promise<void> {
    this.tipoDiaGeneracion = 'NORMAL';

    try {
      this.jefeActual = await this.authService.getUsuarioAutenticado();

      if (this.jefeActual) {
        this.filtroSucursal =
          this.jefeActual.sucursal_nombre ||
          this.jefeActual.sucursal_codigo ||
          null;
      }

      this.setSemanaActualSync();

      try {
        this.vacConfig = await this.vacacionesService.getConfig();
      } catch {
        this.vacConfig = undefined;
      }

      const hoyStr = this.formatFecha(new Date());
      this.generarModo = 'SEMANA';
      this.generarDia = hoyStr;

      await this.cargarDepartamentosControlados();
      await this.cargarUsuarios();
      await this.buscarTurnos();
    } catch (e: any) {
      await SwalStd.error(SwalStd.getErrorMessage(e), 'Error cargando turnos');
    }
  }

  // ==========================
  //   FECHAS / SEMANA
  // ==========================
  private formatFecha(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dia}`;
  }

  private parseFecha(str: string | null | undefined): Date | null {
    if (!str) return null;
    const d = new Date(str + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  private getMonday(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    return x;
  }

  private setSemanaFromDateSync(ref: Date): void {
    const lunes = this.getMonday(ref);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    this.semanaInicio = this.formatFecha(lunes);
    this.semanaFin = this.formatFecha(domingo);
    this.semanaRef = this.formatFecha(ref);

    this.fechaDesde = this.semanaInicio;
    this.fechaHasta = this.semanaFin;

    this.recalcularDiasRango();
    this.recalcularDiasVentana();
  }

  private setSemanaActualSync(): void {
    this.setSemanaFromDateSync(new Date());
  }

  async onCambioSemanaRef(value: string | null): Promise<void> {
    const d = this.parseFecha(value);
    if (!d) return;
    this.setSemanaFromDateSync(d);
    await this.buscarTurnos();
  }

  async semanaAnterior(): Promise<void> {
    const base = this.parseFecha(this.semanaInicio) || new Date();
    base.setDate(base.getDate() - 7);
    this.setSemanaFromDateSync(base);
    await this.buscarTurnos();
  }

  async semanaSiguiente(): Promise<void> {
    const base = this.parseFecha(this.semanaInicio) || new Date();
    base.setDate(base.getDate() + 7);
    this.setSemanaFromDateSync(base);
    await this.buscarTurnos();
  }

  async semanaActual(): Promise<void> {
    this.setSemanaActualSync();
    await this.buscarTurnos();
  }

  private recalcularDiasRango(): void {
    const d1 = this.parseFecha(this.fechaDesde);
    const d2 = this.parseFecha(this.fechaHasta);

    this.diasTotales = 0;
    this.diasHabiles = 0;

    if (!d1 || !d2 || d1 > d2) return;

    let tmp = new Date(d1);
    while (tmp.getTime() <= d2.getTime()) {
      this.diasTotales++;
      const dow = tmp.getDay();
      if (dow !== 0 && dow !== 6) this.diasHabiles++;
      tmp.setDate(tmp.getDate() + 1);
    }
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
        tmp.getDate(),
      ).padStart(2, '0')}`;

      this.diasVentana.push({ fecha: fechaStr, etiqueta });
      tmp.setDate(tmp.getDate() + 1);
    }
  }

  esHoy(fecha: string): boolean {
    return fecha === this.formatFecha(new Date());
  }

  // ==========================
  //   FECHA UI
  // ==========================
  private ymdFromAny(value: any): string {
    if (!value) return '';

    if (typeof value === 'string') {
      if (value.includes('T')) return value.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

      const d = new Date(value);
      if (!isNaN(d.getTime())) return this.formatFecha(d);
      return '';
    }

    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    return this.formatFecha(d);
  }

  fechaUI(value: any): string {
    const ymd = this.ymdFromAny(value);
    if (!ymd) return '—';
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
  }

  rangoUI(desde: any, hasta: any): string {
    return `${this.fechaUI(desde)} → ${this.fechaUI(hasta)}`;
  }

  // ==========================
  //   DEPARTAMENTOS CONTROLADOS
  // ==========================
  private async cargarDepartamentosControlados(): Promise<void> {
    try {
      const lista = await this.usuariosService.getMisDepartamentosControl();

      this.departamentosControlados = (lista || []).sort((a: any, b: any) =>
        String(a.nombre || '').localeCompare(String(b.nombre || '')),
      );

      if (this.departamentosControlados.length === 1) {
        this.departamentoSeleccionadoId = Number(
          this.departamentosControlados[0].id,
        );
      } else {
        this.departamentoSeleccionadoId = null;
      }
    } catch (e: any) {
      this.departamentosControlados = [];
      this.departamentoSeleccionadoId = null;
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'Error cargando departamentos controlados',
      );
    }
  }

  async onCambioDepartamento(): Promise<void> {
    await this.cargarUsuarios();
    await this.buscarTurnos();
  }

  // ==========================
  //   CARGA DE USUARIOS
  // ==========================
  private async cargarUsuarios(): Promise<void> {
    if (this.debeElegirDepartamento && !this.departamentoSeleccionadoId) {
      this.usuarios = [];
      this.usuariosSeleccionadosIds = [];
      return;
    }

    this.cargandoUsuarios = true;
    try {
      let departamentoIdFiltro: number | undefined;

      if (this.departamentoSeleccionadoId) {
        departamentoIdFiltro = this.departamentoSeleccionadoId;
      }

      const lista: any[] =
        await this.usuariosService.getParaTurnos(departamentoIdFiltro);

      this.usuarios = (lista || [])
        .map((u: any) => ({
          id: Number(u.id),
          nombre_completo: `${u.nombre} ${u.apellido}`.trim(),
          saldo_minutos: Number(u.saldo_minutos ?? 0),
        }))
        .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));

      this.usuariosSeleccionadosIds = this.usuariosSeleccionadosIds.filter(
        (id) => this.usuarios.some((u) => u.id === id),
      );
    } catch (e: any) {
      this.usuarios = [];
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'Error cargando colaboradores',
      );
    } finally {
      this.cargandoUsuarios = false;
    }
  }

  // ==========================
  //   TURNOS EXISTENTES
  // ==========================
  private async buscarTurnos(): Promise<void> {
    if (!this.filtroSucursal || !this.fechaDesde || !this.fechaHasta) {
      this.turnos = [];
      this.turnosPorUsuario.clear();
      return;
    }

    if (this.debeElegirDepartamento && !this.departamentoSeleccionadoId) {
      this.turnos = [];
      this.turnosPorUsuario.clear();
      return;
    }

    this.cargandoTurnos = true;
    try {
      const turnos: any[] = await this.turnosService.listarTurnos({
        sucursal: this.filtroSucursal,
        fecha_desde: this.fechaDesde,
        fecha_hasta: this.fechaHasta,
      });

      const idsEquipo = new Set(this.usuarios.map((u) => u.id));
      this.turnos = (turnos || []).filter((t) =>
        idsEquipo.has(Number(t.usuario_id)),
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
    this.turnosPorUsuario = new Map<number, Map<string, any>>();

    for (const t of this.turnos) {
      const uid = Number(t.usuario_id);
      const fechaKey = (t.fecha || '').slice(0, 10);

      if (!this.turnosPorUsuario.has(uid)) {
        this.turnosPorUsuario.set(uid, new Map<string, any>());
      }

      this.turnosPorUsuario.get(uid)!.set(fechaKey, t);
    }
  }

  getTurno(
    usuarioId: number,
    fecha: string,
  ): (ITurnoDiario & { tipo_dia?: TipoDia }) | undefined {
    return this.turnosPorUsuario.get(usuarioId)?.get(fecha);
  }

  // ==========================
  //   REGLAS UI
  // ==========================
  puedeEditarTurno(
    turno: (ITurnoDiario & { tipo_dia?: TipoDia }) | undefined,
  ): boolean {
    if (!turno) return false;

    const tipoDia = (turno.tipo_dia ?? 'NORMAL') as TipoDia;

    // ✅ se permite editar NORMAL y CAMPO
    if (!['NORMAL', 'CAMPO'].includes(tipoDia)) return false;

    const hoyStr = this.formatFecha(new Date());
    const fechaTurno = (turno.fecha || '').slice(0, 10);

    if (fechaTurno < hoyStr) return false;

    // ✅ si CAMPO no exige marcas, igual mantenemos protección:
    if ((turno as any).hora_entrada_real) return false;

    return true;
  }

  puedeEliminarTurno(
    turno: (ITurnoDiario & { tipo_dia?: TipoDia }) | undefined,
  ): boolean {
    return this.puedeEditarTurno(turno);
  }

  puedeAsignarDevolucion(
    turno: (ITurnoDiario & { tipo_dia?: TipoDia }) | undefined,
    usuarioId: number,
  ): boolean {
    if (!turno) return false;

    const tipoDia = (turno.tipo_dia ?? 'NORMAL') as TipoDia;
    if (tipoDia !== 'NORMAL') return false;
    if (!this.puedeEditarTurno(turno)) return false;

    return this.getDisponibleMinutos(usuarioId) >= 480;
  }

  // ==========================
  //   SELECCIÓN / GENERAR
  // ==========================
  seleccionarTodosUsuarios(): void {
    this.usuariosSeleccionadosIds = this.usuariosFiltrados.map((u) => u.id);
  }

  limpiarSeleccionUsuarios(): void {
    this.usuariosSeleccionadosIds = [];
  }

  async onGenerarTurnos(): Promise<void> {
    if (!this.filtroSucursal || this.usuariosSeleccionadosIds.length === 0) {
      await SwalStd.warn('Selecciona al menos 1 colaborador.');
      return;
    }

    const hoyStr = this.formatFecha(new Date());
    if (!this.generarDia) this.generarDia = hoyStr;

    const rangoDesde =
      this.generarModo === 'DIA' ? this.generarDia : this.fechaDesde;
    const rangoHasta =
      this.generarModo === 'DIA' ? this.generarDia : this.fechaHasta;

    if (!rangoDesde || !rangoHasta) {
      await SwalStd.warn('No hay rango válido para generar turnos.');
      return;
    }

    if (this.diasAplicanGeneracion === 0) {
      await SwalStd.warn(
        this.generarModo === 'DIA'
          ? 'El día seleccionado no aplica (fin de semana) con la opción actual.'
          : 'El rango seleccionado no aplica.',
      );
      return;
    }

    const payload: GenerarTurnosPayload = {
      usuario_ids: this.usuariosSeleccionadosIds,
      fecha_desde: rangoDesde,
      fecha_hasta: rangoHasta,
      sucursal: this.filtroSucursal,
      hora_entrada_prog: this.horaEntradaProg,
      hora_salida_prog: this.horaSalidaProg,
      min_toler_atraso: 1,
      min_toler_salida: 0,
      excluir_fines_semana: this.excluirFinesSemana,
      tipo_dia: this.tipoDiaGeneracion,
    };

    this.generandoTurnos = true;
    try {
      await this.turnosService.generarTurnos(payload);
      await this.buscarTurnos();

      await SwalStd.success(
        this.generarModo === 'DIA'
          ? 'Turno generado para el día seleccionado'
          : 'Turnos generados para la semana',
      );
    } catch (e: any) {
      await SwalStd.error(SwalStd.getErrorMessage(e), 'Error generando turnos');
    } finally {
      this.generandoTurnos = false;
    }
  }

  limpiarFormulario(): void {
    this.tipoDiaGeneracion = 'NORMAL';
    this.setSemanaActualSync();

    this.horaEntradaProg = '08:00';
    this.horaSalidaProg = '17:00';
    this.excluirFinesSemana = true;

    this.filtroTextoUsuario = '';
    this.usuariosSeleccionadosIds = [];

    this.generarModo = 'SEMANA';
    this.generarDia = this.formatFecha(new Date());

    this.buscarTurnos();
  }

  // ==========================
  //   EDITAR / ELIMINAR
  // ==========================
  async onEditarTurno(turno: ITurnoDiario): Promise<void> {
    if (!this.puedeEditarTurno(turno)) return;

    const entradaActual = turno.hora_entrada_prog?.slice(0, 5) || '08:00';
    const salidaActual = turno.hora_salida_prog?.slice(0, 5) || '17:00';

    const res = await SwalStd.inputHorario({
      title: 'Modificar horario del turno',
      entradaDefault: entradaActual,
      salidaDefault: salidaActual,
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
    });

    if (!res) return;

    await this.withSaving(turno.id, async () => {
      await this.turnosService.actualizarTurno(turno.id, {
        hora_entrada_prog: `${res.entrada}:00`,
        hora_salida_prog: `${res.salida}:00`,
      });

      turno.hora_entrada_prog = `${res.entrada}:00`;
      turno.hora_salida_prog = `${res.salida}:00`;

      await SwalStd.success('Turno actualizado');
    });
  }

  async onEliminarTurno(turno: ITurnoDiario): Promise<void> {
    if (!this.puedeEliminarTurno(turno)) return;

    const ok = await SwalStd.confirm({
      title: '¿Eliminar turno?',
      text: `Se eliminará el turno del ${turno.fecha?.slice(0, 10)}.`,
      confirmText: 'Eliminar',
    });
    if (!ok) return;

    await this.withSaving(turno.id, async () => {
      await this.turnosService.eliminarTurno(turno.id);

      const uid = Number(turno.usuario_id);
      const fechaKey = (turno.fecha || '').slice(0, 10);
      this.turnosPorUsuario.get(uid)?.delete(fechaKey);
      this.turnos = this.turnos.filter((t) => t.id !== turno.id);

      await SwalStd.success('Turno eliminado');
    });
  }

  // ==========================
  //   DEVOLUCIÓN
  // ==========================
  async onAsignarDevolucion(
    turno: ITurnoDiario & { tipo_dia?: TipoDia },
    usuarioId: number,
  ): Promise<void> {
    if (!this.puedeAsignarDevolucion(turno, usuarioId)) return;

    const ok = await SwalStd.confirm({
      title: 'Asignar DEVOLUCIÓN',
      text: 'Se marcará este día como DEVOLUCIÓN y se descontarán 8 horas del saldo.',
      confirmText: 'Asignar',
    });
    if (!ok) return;

    await this.withSaving(turno.id, async () => {
      await (this.turnosService as any).asignarDevolucion(turno.id);

      turno.tipo_dia = 'DEVOLUCION';
      this.sumarSaldoMinutos(usuarioId, -480);

      await SwalStd.success('DEVOLUCIÓN asignada');
    });
  }

  // ==========================
  //   HELPERS SALDO / UI
  // ==========================
  getSaldoMinutos(usuarioId: number): number {
    return Number(
      this.usuarios.find((u) => u.id === usuarioId)?.saldo_minutos ?? 0,
    );
  }

  sumarSaldoMinutos(usuarioId: number, delta: number): void {
    const u = this.usuarios.find((x) => x.id === usuarioId);
    if (!u) return;
    u.saldo_minutos = Number(u.saldo_minutos ?? 0) + Number(delta ?? 0);
  }

  saldoHHMM(minutos: number): string {
    const n = Number(minutos || 0);
    const sign = n < 0 ? '-' : '';
    const m = Math.abs(n);

    const hh = Math.floor(m / 60);
    const mm = m % 60;

    return `${sign}${String(hh).padStart(2, '0')}:${String(mm).padStart(
      2,
      '0',
    )}`;
  }

  tieneSaldoParaDevolucion(usuarioId: number): boolean {
    return this.getSaldoMinutos(usuarioId) >= 480;
  }

  tipoDiaLabel(turno?: ITurnoDiario & { tipo_dia?: TipoDia }): string {
    return (turno?.tipo_dia ?? 'NORMAL') as string;
  }

  async withSaving(turnoId: number, fn: () => Promise<void>) {
    this.savingTurno[turnoId] = true;
    try {
      await fn();
    } finally {
      this.savingTurno[turnoId] = false;
    }
  }

  rangoHorario(turno?: ITurnoDiario): string {
    if (!turno) return '';
    const ent = turno.hora_entrada_prog?.slice(0, 5) || '--:--';
    const sal = turno.hora_salida_prog?.slice(0, 5) || '--:--';
    return `${ent} - ${sal}`;
  }

  getDisponibleMinutos(usuarioId: number): number {
    const saldo = this.getSaldoMinutos(usuarioId);
    return Math.max(0, saldo);
  }

  getDebeMinutos(usuarioId: number): number {
    const saldo = this.getSaldoMinutos(usuarioId);
    return Math.max(0, -saldo);
  }

  // ==========================
  //   VACACIONES
  // ==========================
  async onSelectVacUsuario(usuarioId: number | null): Promise<void> {
    this.vacUsuarioId = usuarioId;
    this.vacResumen = undefined;
    this.vacPreview = undefined;
    this.vacHistorial = [];

    if (!usuarioId) return;

    this.cargandoVac = true;
    try {
      this.vacResumen =
        await this.vacacionesService.getResumenUsuario(usuarioId);
      this.vacHistorial = await this.vacacionesService.listarAsignaciones({
        usuario_id: usuarioId,
        estado: 'TODAS',
        limit: 50,
        offset: 0,
      });
    } catch (e: any) {
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'Error cargando vacaciones',
      );
    } finally {
      this.cargandoVac = false;
    }
  }

  private validarRangoVac(): string | null {
    if (!this.vacUsuarioId) return 'Seleccione un trabajador.';
    if (!this.vacFechaDesde || !this.vacFechaHasta) {
      return 'Seleccione fecha desde y hasta.';
    }
    if (this.vacFechaDesde > this.vacFechaHasta) {
      return 'Rango inválido: desde > hasta.';
    }

    const corte = this.vacConfig?.fecha_corte;
    if (corte && this.vacFechaDesde < corte) {
      return `No permitido antes de la fecha de corte (${corte}).`;
    }

    return null;
  }

  async onPreviewVacaciones(): Promise<void> {
    const err = this.validarRangoVac();
    if (err) {
      await SwalStd.warn(err);
      return;
    }

    this.cargandoVac = true;
    try {
      this.vacPreview = await this.vacacionesService.preview({
        usuario_id: this.vacUsuarioId!,
        fecha_desde: this.vacFechaDesde!,
        fecha_hasta: this.vacFechaHasta!,
      });
    } catch (e: any) {
      this.vacPreview = undefined;
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'No se pudo previsualizar',
      );
    } finally {
      this.cargandoVac = false;
    }
  }

  async onCrearVacaciones(): Promise<void> {
    const err = this.validarRangoVac();
    if (err) {
      await SwalStd.warn(err);
      return;
    }

    const ok = await SwalStd.confirm({
      title: 'Asignar VACACIONES',
      text: `Se marcará el rango ${this.vacFechaDesde} a ${this.vacFechaHasta} como VACACIONES.`,
      confirmText: 'Asignar',
    });
    if (!ok) return;

    this.creandoVac = true;
    try {
      const resp = await this.vacacionesService.crear({
        usuario_id: this.vacUsuarioId!,
        fecha_desde: this.vacFechaDesde!,
        fecha_hasta: this.vacFechaHasta!,
        observacion: this.vacObservacion?.trim() || null,
      });

      await this.buscarTurnos();
      await this.onSelectVacUsuario(this.vacUsuarioId);

      await SwalStd.success('✅ Vacaciones asignadas (acta generada)');

      const fileId = resp?.acta?.file_id;
      if (fileId) {
        const abrir = await SwalStd.confirm({
          title: 'Descargar acta',
          text: '¿Deseas abrir/descargar el PDF del acta ahora?',
          confirmText: 'Abrir',
          cancelText: 'Luego',
        });
        if (abrir) this.abrirDescargaFile(fileId);
      }
    } catch (e: any) {
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'Error creando vacaciones',
      );
    } finally {
      this.creandoVac = false;
    }
  }

  async onAnularVacacion(asig: VacAsignacion): Promise<void> {
    const ok = await SwalStd.confirm({
      title: 'Anular vacaciones',
      text: `Se revertirá el rango ${asig.fecha_desde} a ${asig.fecha_hasta}.`,
      confirmText: 'Anular',
    });
    if (!ok) return;

    this.anulandoVac[asig.id] = true;
    try {
      await this.vacacionesService.anular(asig.id, 'Ajuste/edición');

      await this.buscarTurnos();
      await this.onSelectVacUsuario(this.vacUsuarioId);

      await SwalStd.success('✅ Vacaciones anuladas');
    } catch (e: any) {
      await SwalStd.error(SwalStd.getErrorMessage(e), 'Error anulando');
    } finally {
      this.anulandoVac[asig.id] = false;
    }
  }

  async onDescargarActaVacacion(asig: VacAsignacion): Promise<void> {
    try {
      const fileId =
        asig.acta_file_id ||
        (await this.vacacionesService.getActa(asig.id)).file_id;

      if (!fileId) {
        await SwalStd.warn('Acta no encontrada.');
        return;
      }

      this.abrirDescargaFile(fileId);
    } catch (e: any) {
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'No se pudo obtener el acta',
      );
    }
  }

  private abrirDescargaFile(fileId: number) {
    window.open(`${environment.API_URL}/files/${fileId}/download`, '_blank');
  }

  puedeAnularVacacion(asig: VacAsignacion): boolean {
    if (!asig) return false;

    const hoy = this.formatFecha(new Date());
    const hasta = (asig.fecha_hasta || '').toString().slice(0, 10);

    if (!hasta || hasta.length !== 10) return false;

    return asig.estado === 'ACTIVA' && hasta >= hoy;
  }
}
