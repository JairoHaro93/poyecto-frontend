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

interface UsuarioResumen {
  id: number;
  nombre_completo: string;
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

  // Rango: totales / hábiles (para cálculo de turnos)
  diasTotales = 0;
  diasHabiles = 0;

  // columnas del calendario (como en Horarios)
  diasVentana: DiaColumna[] = [];

  usuarios: UsuarioResumen[] = [];
  usuariosSeleccionadosIds: number[] = [];
  cargandoUsuarios = false;
  filtroTextoUsuario = '';

  horaEntradaProg = '08:00';
  horaSalidaProg = '17:00';

  excluirFinesSemana = true;

  generandoTurnos = false;

  // 🔹 usuario que está asignando los turnos (jefe)
  jefeActual?: Iusuarios;

  // 🔹 departamentos disponibles en la sucursal (solo para jefe de sucursal)
  departamentosSucursal: IDepartamento[] = [];
  departamentoSeleccionadoId: number | null = null;

  // ==========================
  //   TURNOS EXISTENTES
  // ==========================

  turnos: ITurnoDiario[] = [];
  turnosPorUsuario = new Map<number, Map<string, ITurnoDiario>>();
  cargandoTurnos = false;

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
    // 1) Usuario logueado (jefe)
    this.jefeActual = await this.authService.getUsuarioAutenticado();
    console.log('[TURNOS] jefeActual (frontend):', this.jefeActual);

    // 2) Fijar sucursal según el jefe
    if (this.jefeActual) {
      this.filtroSucursal =
        this.jefeActual.sucursal_nombre ||
        this.jefeActual.sucursal_codigo ||
        null;
    }

    // 3) Si es jefe de sucursal, cargar los departamentos de su sucursal
    if (this.esJefeSucursal && this.jefeActual?.sucursal_id) {
      await this.cargarDepartamentosSucursal(this.jefeActual.sucursal_id);
    }

    // 4) Rango por defecto igual que en Horarios (2 antes / 3 después, máx 6 días)
    this.setRangoPorDefecto();

    // 5) Cargar usuarios y turnos
    await this.cargarUsuarios();
    await this.buscarTurnos();
  }

  // ==========================
  //   FECHAS / RANGO
  // ==========================

  private setRangoPorDefecto(): void {
    const hoy = new Date();

    const dDesde = new Date(hoy);
    dDesde.setDate(hoy.getDate() - 2); // 2 días antes

    const dHasta = new Date(hoy);
    dHasta.setDate(hoy.getDate() + 3); // 3 días después

    this.fechaDesde = this.formatFecha(dDesde);
    this.fechaHasta = this.formatFecha(dHasta);

    // Recalcular totales/hábiles y columnas de calendario
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

  // Recalcula díasTotales y díasHabiles (lun-vie) en el rango actual
  private recalcularDiasRango(): void {
    const d1 = this.parseFecha(this.fechaDesde);
    const d2 = this.parseFecha(this.fechaHasta);

    this.diasTotales = 0;
    this.diasHabiles = 0;

    if (!d1 || !d2 || d1 > d2) return;

    let tmp = new Date(d1);
    while (tmp.getTime() <= d2.getTime()) {
      this.diasTotales++;
      const dow = tmp.getDay(); // 0=Dom, 6=Sab
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

    console.log('[TURNOS] diasVentana:', this.diasVentana);
  }

  /**
   * Lógica igual a Horarios:
   * - Máx. 6 días de diferencia (inclusive).
   * - Si se pasa, ajusta la otra fecha.
   * - Recalcula ventana, días y vuelve a buscar turnos.
   */
  private enforceMaxRangoDias(origen: 'desde' | 'hasta'): void {
    const d1 = this.parseFecha(this.fechaDesde);
    const d2 = this.parseFecha(this.fechaHasta);

    if (!d1 || !d2) {
      this.recalcularDiasRango();
      this.recalcularDiasVentana();
      this.buscarTurnos();
      return;
    }

    let start = d1;
    let end = d2;

    // Asegurar que fechaDesde <= fechaHasta
    if (end < start) {
      if (origen === 'desde') {
        this.fechaHasta = this.formatFecha(start);
        end = start;
      } else {
        this.fechaDesde = this.formatFecha(end);
        start = end;
      }
    }

    const diffMs = end.getTime() - start.getTime();
    const dias = Math.floor(diffMs / 86400000) + 1; // inclusivo

    if (dias > 6) {
      if (origen === 'desde') {
        const nuevaHasta = new Date(start);
        nuevaHasta.setDate(start.getDate() + 5); // 6 días en total
        this.fechaHasta = this.formatFecha(nuevaHasta);
        console.warn(
          '[TURNOS] Rango máximo 6 días: ajustando fechaHasta a',
          this.fechaHasta
        );
      } else {
        const nuevaDesde = new Date(end);
        nuevaDesde.setDate(end.getDate() - 5);
        this.fechaDesde = this.formatFecha(nuevaDesde);
        console.warn(
          '[TURNOS] Rango máximo 6 días: ajustando fechaDesde a',
          this.fechaDesde
        );
      }
    }

    // Recalcular y refrescar turnos
    this.recalcularDiasRango();
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
      console.log(
        '[TURNOS] Departamentos de la sucursal:',
        this.departamentosSucursal
      );
    } catch (error) {
      console.error('❌ Error cargando departamentos de sucursal:', error);
      this.departamentosSucursal = [];
    }
  }

  async onCambioDepartamento(): Promise<void> {
    console.log(
      '[TURNOS] Cambio de departamento seleccionado:',
      this.departamentoSeleccionadoId
    );
    await this.cargarUsuarios();
    await this.buscarTurnos();
  }

  // ==========================
  //   CARGA DE USUARIOS
  // ==========================

  private async cargarUsuarios(): Promise<void> {
    this.cargandoUsuarios = true;
    try {
      const jefe =
        this.jefeActual || (await this.authService.getUsuarioAutenticado());
      console.log('[TURNOS] Usuario actual (angular):', jefe);

      let departamentoIdFiltro: number | undefined;

      // 🔹 Si es jefe de sucursal, usamos el departamento seleccionado (si lo hay)
      if (this.esJefeSucursal && this.departamentoSeleccionadoId) {
        departamentoIdFiltro = this.departamentoSeleccionadoId;
      }

      const lista: Iusuarios[] = await this.usuariosService.getParaTurnos(
        departamentoIdFiltro
      );
      console.log('[TURNOS] Lista desde backend (para-turnos):', lista);

      this.usuarios = (lista || [])
        .map((u) => ({
          id: Number(u.id),
          nombre_completo: `${u.nombre} ${u.apellido}`.trim(),
        }))
        .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));

      console.log('[TURNOS] Usuarios mapeados para selector:', this.usuarios);
    } catch (error) {
      console.error('❌ Error cargando usuarios para turnos:', error);
      this.usuarios = [];
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

      console.log(
        '[TURNOS] Turnos crudos desde backend (generación):',
        turnos.length
      );

      const idsEquipo = new Set(this.usuarios.map((u) => u.id));

      const filtrados = (turnos || []).filter((t) =>
        idsEquipo.has(Number(t.usuario_id))
      );

      this.turnos = filtrados;
      this.buildTurnosIndex();

      console.log(
        '[TURNOS] Turnos filtrados (equipo para generación):',
        this.turnos.length
      );
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
      const fechaKey = (t.fecha || '').slice(0, 10); // 'YYYY-MM-DD'

      if (!this.turnosPorUsuario.has(uid)) {
        this.turnosPorUsuario.set(uid, new Map<string, ITurnoDiario>());
      }
      this.turnosPorUsuario.get(uid)!.set(fechaKey, t);
    }

    console.log('[TURNOS] turnosPorUsuario indexado:', this.turnosPorUsuario);
  }

  getTurno(usuarioId: number, fecha: string): ITurnoDiario | undefined {
    return this.turnosPorUsuario.get(usuarioId)?.get(fecha);
  }

  // Helpers para habilitar/inhabilitar edición/eliminación
  puedeEditarTurno(turno: ITurnoDiario | undefined): boolean {
    if (!turno) return false;
    const hoyStr = this.formatFecha(new Date());
    const fechaTurno = (turno.fecha || '').slice(0, 10);

    // No editar días pasados
    if (fechaTurno < hoyStr) return false;

    // No editar si ya tiene marca de entrada real (evitar "sabotear")
    if (turno.hora_entrada_real) return false;

    return true;
  }

  puedeEliminarTurno(turno: ITurnoDiario | undefined): boolean {
    return this.puedeEditarTurno(turno);
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
      return;
    }

    const payload: GenerarTurnosPayload = {
      usuario_ids: this.usuariosSeleccionadosIds,
      fecha_desde: this.fechaDesde,
      fecha_hasta: this.fechaHasta,
      sucursal: this.filtroSucursal,
      hora_entrada_prog: this.horaEntradaProg,
      hora_salida_prog: this.horaSalidaProg,
      min_toler_atraso: 0, // 👈 si algún día quieres tolerancia, cámbialo aquí
      min_toler_salida: 0, // 👈 y aquí
      excluir_fines_semana: this.excluirFinesSemana,
    };

    this.generandoTurnos = true;
    try {
      const resp = await this.turnosService.generarTurnos(payload);
      console.log('✅ Turnos generados:', resp);

      await this.buscarTurnos();
    } catch (error) {
      console.error('❌ Error generando turnos:', error);
    } finally {
      this.generandoTurnos = false;
    }
  }

  limpiarFormulario(): void {
    // Sucursal NO se toca, queda fija según jefe
    this.setRangoPorDefecto();

    this.horaEntradaProg = '08:00';
    this.horaSalidaProg = '17:00';

    this.excluirFinesSemana = true;

    this.filtroTextoUsuario = '';
    this.usuariosSeleccionadosIds = [];

    this.buscarTurnos();
  }

  // ==========================
  //   EDITAR / ELIMINAR
  // ==========================

  async onEditarTurno(turno: ITurnoDiario): Promise<void> {
    if (!this.puedeEditarTurno(turno)) return;

    const entradaActual = turno.hora_entrada_prog?.slice(0, 5) || '08:00';
    const salidaActual = turno.hora_salida_prog?.slice(0, 5) || '17:00';

    const nuevaEntrada = window.prompt(
      'Hora de entrada (HH:MM)',
      entradaActual
    );
    if (!nuevaEntrada) return;

    const nuevaSalida = window.prompt('Hora de salida (HH:MM)', salidaActual);
    if (!nuevaSalida) return;

    try {
      await this.turnosService.actualizarTurno(turno.id, {
        hora_entrada_prog: `${nuevaEntrada}:00`,
        hora_salida_prog: `${nuevaSalida}:00`,
      });
      console.log('✅ Turno actualizado:', turno.id);
      await this.buscarTurnos();
    } catch (error) {
      console.error('❌ Error actualizando turno:', error);
    }
  }

  async onEliminarTurno(turno: ITurnoDiario): Promise<void> {
    if (!this.puedeEliminarTurno(turno)) return;

    const ok = window.confirm(
      `¿Eliminar el turno de ${turno.fecha?.slice(0, 10)} para el usuario #${
        turno.usuario_id
      }?`
    );
    if (!ok) return;

    try {
      await this.turnosService.eliminarTurno(turno.id);
      console.log('🗑 Turno eliminado:', turno.id);
      await this.buscarTurnos();
    } catch (error) {
      console.error('❌ Error eliminando turno:', error);
    }
  }

  rangoHorario(turno?: ITurnoDiario): string {
    if (!turno) return '';
    const ent = turno.hora_entrada_prog?.slice(0, 5) || '--:--';
    const sal = turno.hora_salida_prog?.slice(0, 5) || '--:--';
    return `${ent} - ${sal}`;
  }
}
