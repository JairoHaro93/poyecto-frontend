// src/app/pages/.../turnos/turnos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import {
  TurnosService,
  GenerarTurnosPayload,
  ITurnoDiario,
} from '../../../../services/negocio_latacunga/turnos.service';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { DepartamentosService } from '../../../../services/sistema/departamentos.service';
import { IDepartamento } from '../../../../interfaces/sistema/idepartamento.interface';

import { SwalStd } from '../../../../utils/swal.std';

type TipoDia = 'NORMAL' | 'DEVOLUCION' | 'VACACIONES' | 'PERMISO';

interface UsuarioResumen {
  id: number;
  nombre_completo: string;

  // ✅ saldo del kardex (minutos). Si backend no lo envía, queda 0.
  saldo_minutos: number;
}

interface DiaColumna {
  fecha: string; // 'YYYY-MM-DD'
  etiqueta: string; // 'Jue 12'
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
  //   FILTROS / CONTEXTO
  // ==========================
  sucursales: string[] = ['LATACUNGA', 'COTOPAXI', 'QUITO', 'AMBATO', 'OTRA'];

  filtroSucursal: string | null = null;
  fechaDesde: string | null = null; // 'YYYY-MM-DD'
  fechaHasta: string | null = null;

  diasTotales = 0;
  diasHabiles = 0;

  diasVentana: DiaColumna[] = [];

  usuarios: UsuarioResumen[] = [];
  usuariosSeleccionadosIds: number[] = [];
  cargandoUsuarios = false;
  filtroTextoUsuario = '';

  horaEntradaProg = '08:00';
  horaSalidaProg = '17:00';

  excluirFinesSemana = true;

  generandoTurnos = false;

  jefeActual?: Iusuarios;

  departamentosSucursal: IDepartamento[] = [];
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

  // evita “parpadeo” por botón (deshabilitar por turno)
  savingTurno: Record<number, boolean> = {};

  constructor(
    private usuariosService: UsuariosService,
    private turnosService: TurnosService,
    private authService: AutenticacionService,
    private departamentosService: DepartamentosService
  ) {}

  // ✅ es jefe de sucursal => tiene sucursal pero NO departamento
  get esJefeSucursal(): boolean {
    return !!this.jefeActual?.sucursal_id && !this.jefeActual?.departamento_id;
  }

  get diasAplican(): number {
    return this.excluirFinesSemana ? this.diasHabiles : this.diasTotales;
  }

  get usuariosFiltrados(): UsuarioResumen[] {
    const texto = this.filtroTextoUsuario.trim().toLowerCase();
    if (!texto) return this.usuarios;
    return this.usuarios.filter((u) =>
      u.nombre_completo.toLowerCase().includes(texto)
    );
  }

  // ==========================
  //   CICLO DE VIDA
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

      await this.cargarUsuarios();

      await this.buscarTurnos();
    } catch (e: any) {
      await SwalStd.error(SwalStd.getErrorMessage(e), 'Error cargando turnos');
    }
  }

  // ==========================
  //   FECHAS / RANGO
  // ==========================
  private setRangoPorDefecto(): void {
    const hoy = new Date();

    const dDesde = new Date(hoy);
    dDesde.setDate(hoy.getDate() - 2);

    const dHasta = new Date(hoy);
    dHasta.setDate(hoy.getDate() + 3);

    this.fechaDesde = this.formatFecha(dDesde);
    this.fechaHasta = this.formatFecha(dHasta);

    this.recalcularDiasRango();
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
      this.recalcularDiasRango();
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
        'El rango máximo es 6 días. Se ajustó automáticamente.'
      );
    }

    this.recalcularDiasRango();
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

  esHoy(fecha: string): boolean {
    const hoyStr = this.formatFecha(new Date());
    return fecha === hoyStr;
  }

  // ==========================
  //   DEPARTAMENTOS SUCURSAL
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

  async onCambioDepartamento(): Promise<void> {
    await this.cargarUsuarios();
    console.log('usuarios:', this.usuarios);
    await this.buscarTurnos();
  }

  // ==========================
  //   CARGA DE USUARIOS
  // ==========================
  private async cargarUsuarios(): Promise<void> {
    this.cargandoUsuarios = true;
    try {
      let departamentoIdFiltro: number | undefined;

      if (this.esJefeSucursal && this.departamentoSeleccionadoId) {
        departamentoIdFiltro = this.departamentoSeleccionadoId;
      }

      const lista: any[] = await this.usuariosService.getParaTurnos(
        departamentoIdFiltro
      );

      // ✅ Si backend ya envía saldo_minutos, aquí se mostrará.
      //    Si no lo envía, queda 0 sin romper nada.
      this.usuarios = (lista || [])
        .map((u: any) => ({
          id: Number(u.id),
          nombre_completo: `${u.nombre} ${u.apellido}`.trim(),
          saldo_minutos: Number(u.saldo_minutos ?? 0),
        }))
        .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
    } catch (e: any) {
      this.usuarios = [];
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'Error cargando colaboradores'
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

    if (this.esJefeSucursal && !this.departamentoSeleccionadoId) {
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
    fecha: string
  ): (ITurnoDiario & { tipo_dia?: TipoDia }) | undefined {
    return this.turnosPorUsuario.get(usuarioId)?.get(fecha);
  }

  // ==========================
  //   REGLAS UI
  // ==========================
  puedeEditarTurno(turno: ITurnoDiario | undefined): boolean {
    if (!turno) return false;
    const hoyStr = this.formatFecha(new Date());
    const fechaTurno = (turno.fecha || '').slice(0, 10);

    if (fechaTurno < hoyStr) return false;
    if ((turno as any).hora_entrada_real) return false;

    return true;
  }

  puedeEliminarTurno(turno: ITurnoDiario | undefined): boolean {
    return this.puedeEditarTurno(turno);
  }

  // ✅ DEVOLUCIÓN: saldo >= 480, turno NORMAL, y puede editar (no pasado, sin marcas)
  puedeAsignarDevolucion(
    turno: (ITurnoDiario & { tipo_dia?: TipoDia }) | undefined,
    usuarioId: number
  ): boolean {
    if (!turno) return false;

    const tipoDia = (turno.tipo_dia ?? 'NORMAL') as TipoDia;
    if (tipoDia !== 'NORMAL') return false;

    if (!this.puedeEditarTurno(turno)) return false;

    const saldo = this.getSaldoMinutos(usuarioId);
    return saldo >= 480;
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
    if (
      !this.filtroSucursal ||
      !this.fechaDesde ||
      !this.fechaHasta ||
      this.usuariosSeleccionadosIds.length === 0
    ) {
      await SwalStd.warn('Selecciona rango y al menos 1 colaborador.');
      return;
    }

    const payload: GenerarTurnosPayload = {
      usuario_ids: this.usuariosSeleccionadosIds,
      fecha_desde: this.fechaDesde,
      fecha_hasta: this.fechaHasta,
      sucursal: this.filtroSucursal,
      hora_entrada_prog: this.horaEntradaProg,
      hora_salida_prog: this.horaSalidaProg,
      min_toler_atraso: 0,
      min_toler_salida: 0,
      excluir_fines_semana: this.excluirFinesSemana,
    };

    this.generandoTurnos = true;
    try {
      await this.turnosService.generarTurnos(payload);
      await this.buscarTurnos();
      await SwalStd.success('Turnos generados correctamente');
    } catch (e: any) {
      await SwalStd.error(SwalStd.getErrorMessage(e), 'Error generando turnos');
    } finally {
      this.generandoTurnos = false;
    }
  }

  limpiarFormulario(): void {
    this.setRangoPorDefecto();

    this.horaEntradaProg = '08:00';
    this.horaSalidaProg = '17:00';

    this.excluirFinesSemana = true;

    this.filtroTextoUsuario = '';
    this.usuariosSeleccionadosIds = [];

    this.buscarTurnos();
  }

  // ==========================
  //   EDITAR / ELIMINAR (sin recargar = menos “parpadeo”)
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

      // ✅ update local (sin buscarTurnos)
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

      // ✅ remove local (sin buscarTurnos)
      const uid = Number(turno.usuario_id);
      const fechaKey = (turno.fecha || '').slice(0, 10);
      this.turnosPorUsuario.get(uid)?.delete(fechaKey);
      this.turnos = this.turnos.filter((t) => t.id !== turno.id);

      await SwalStd.success('Turno eliminado');
    });
  }

  // ==========================
  //   DEVOLUCIÓN (Turnos)
  // ==========================
  async onAsignarDevolucion(
    turno: ITurnoDiario & { tipo_dia?: TipoDia },
    usuarioId: number
  ): Promise<void> {
    if (!this.puedeAsignarDevolucion(turno, usuarioId)) return;

    const ok = await SwalStd.confirm({
      title: 'Asignar DEVOLUCIÓN',
      text: 'Se marcará este día como DEVOLUCIÓN y se descontarán 8 horas del saldo.',
      confirmText: 'Asignar',
    });
    if (!ok) return;

    await this.withSaving(turno.id, async () => {
      // ✅ Endpoint: PUT /api/turnos/devolucion/:id
      // Agrega el método en TurnosService (abajo te dejo el snippet).
      await (this.turnosService as any).asignarDevolucion(turno.id);

      // ✅ update local (sin recargar)
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
      this.usuarios.find((u) => u.id === usuarioId)?.saldo_minutos ?? 0
    );
  }

  sumarSaldoMinutos(usuarioId: number, delta: number): void {
    const u = this.usuarios.find((x) => x.id === usuarioId);
    if (!u) return;
    u.saldo_minutos = Number(u.saldo_minutos ?? 0) + Number(delta ?? 0);
    if (u.saldo_minutos < 0) u.saldo_minutos = 0;
  }

  saldoHHMM(minutos: number): string {
    const m = Math.max(0, Number(minutos || 0));
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
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
}
