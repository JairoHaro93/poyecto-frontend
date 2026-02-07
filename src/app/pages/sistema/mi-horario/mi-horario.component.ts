import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MiHorarioService,
  DiaHorarioSemanaApi,
} from '../../../services/sistema/mi-horario.service';

type EditForm = {
  obs: string;
  haMin: number; // 0|60..900 step 30
  motAtraso: string;
  motSalida: string;
};

@Component({
  selector: 'app-mi-horario',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './mi-horario.component.html',
  styleUrl: './mi-horario.component.css',
})
export class MiHorarioComponent implements OnInit {
  private srv = inject(MiHorarioService);

  cargando = false;

  selectedYmd = this.ymd(new Date());
  desde = '';
  hasta = '';

  totalHorasAcumuladasMin = 0;
  vacacionesDisponiblesDias = 0;

  dias: DiaHorarioSemanaApi[] = [];

  // =========================
  // Modal state
  // =========================
  modalOpen = false;
  diaEdit: DiaHorarioSemanaApi | null = null;

  form: EditForm = {
    obs: '',
    haMin: 0,
    motAtraso: '',
    motSalida: '',
  };

  // permisos ya calculados al abrir modal
  puedeObsHA = false;
  puedeJustA = false;
  puedeJustS = false;

  ngOnInit(): void {
    void this.cargarSemanaPorFecha(this.selectedYmd);
  }

  // =========================
  // Semana
  // =========================
  async cargarSemanaPorFecha(fechaYmd: string) {
    this.cargando = true;
    try {
      const res = await this.srv.getMiHorarioSemana(fechaYmd);
      this.desde = res.desde;
      this.hasta = res.hasta;
      this.totalHorasAcumuladasMin = Number(
        res.total_horas_acumuladas_min ?? 0,
      );
      this.vacacionesDisponiblesDias = Number(
        res.vacaciones_disponibles_dias ?? 0,
      );

      this.dias = (res.data ?? []).map((d) => this.normalize(d));
    } finally {
      this.cargando = false;
    }
  }

  async refresh() {
    await this.cargarSemanaPorFecha(this.selectedYmd);
  }

  async prevWeek() {
    const d = this.parseYmdLocal(this.selectedYmd);
    d.setDate(d.getDate() - 7);
    this.selectedYmd = this.ymd(d);
    await this.cargarSemanaPorFecha(this.selectedYmd);
  }

  async nextWeek() {
    const d = this.parseYmdLocal(this.selectedYmd);
    d.setDate(d.getDate() + 7);
    this.selectedYmd = this.ymd(d);
    await this.cargarSemanaPorFecha(this.selectedYmd);
  }

  async onPickDate() {
    await this.cargarSemanaPorFecha(this.selectedYmd);
  }

  private normalize(d: DiaHorarioSemanaApi): DiaHorarioSemanaApi {
    return {
      ...d,
      estado_asistencia: (d.estado_asistencia ?? 'SIN_TURNO')
        .toString()
        .toUpperCase()
        .trim(),
      tipo_dia: (d.tipo_dia ?? 'NORMAL').toString().toUpperCase().trim(),
      estado_hora_acumulada: (d.estado_hora_acumulada ?? 'NO')
        .toString()
        .toUpperCase()
        .trim(),
      just_atraso_estado: (d.just_atraso_estado ?? 'NO')
        .toString()
        .toUpperCase()
        .trim(),
      just_salida_estado: (d.just_salida_estado ?? 'NO')
        .toString()
        .toUpperCase()
        .trim(),
    };
  }

  trackByFecha = (_: number, d: DiaHorarioSemanaApi) => d.fecha;

  // =========================
  // UI helpers (similar Flutter)
  // =========================
  get totalHorasAcumuladasHHMM() {
    return this.mmToHHMM(this.totalHorasAcumuladasMin);
  }

  get vacacionesDisponiblesTxt() {
    return String(this.vacacionesDisponiblesDias ?? 0);
  }

  estadoUILabel(d: DiaHorarioSemanaApi): string {
    const tipo = (d.tipo_dia ?? 'NORMAL').toUpperCase();
    if (tipo !== 'NORMAL') return tipo;

    if (!d.tiene_turno) return 'SIN TURNO';

    const day = this.parseYmdLocal(d.fecha);

    if (this.isFutureDayObj(day)) return 'PROGRAMADO';

    if (this.isTodayObj(day)) {
      if (d.hora_entrada_real && !d.hora_salida_real) return 'EN CURSO';

      const est = (d.estado_asistencia ?? 'SIN_MARCA').toUpperCase();
      if (est === 'SIN_MARCA')
        return this.isBeforeHoraEntradaProgHoy(d) ? 'PROGRAMADO' : 'SIN MARCA';
      if (est === 'OK') return 'COMPLETO';
      return est.replaceAll('_', ' ');
    }

    // pasado
    const est = (d.estado_asistencia ?? 'SIN_MARCA').toUpperCase();
    if (est === 'SIN_MARCA') return 'FALTA';
    if (est === 'OK') return 'COMPLETO';
    return est.replaceAll('_', ' ');
  }

  chipClassEstado(d: DiaHorarioSemanaApi): string {
    const s = this.estadoUILabel(d);
    if (['COMPLETO', 'OK'].includes(s)) return 'chip-ok';
    if (['ATRASO', 'INCOMPLETO', 'FALTA', 'SIN MARCA'].includes(s))
      return 'chip-bad';
    if (['EN CURSO'].includes(s)) return 'chip-warn';
    if (['PROGRAMADO'].includes(s)) return 'chip-info';
    return 'chip-muted';
  }

  horaAcumuladaVisible(d: DiaHorarioSemanaApi): boolean {
    return (d.estado_hora_acumulada ?? 'NO').toUpperCase() !== 'NO';
  }

  horaAcumuladaLabel(d: DiaHorarioSemanaApi): string {
    const st = (d.estado_hora_acumulada ?? 'NO').toUpperCase();
    const min = this.haToMinutes(d.num_minutos_acumulados);
    const labelTime = min > 0 ? ` ${this.mmToHHMM(min)}` : '';
    return `Hora Acum. ${this.shortEstado(st)}${labelTime}`;
  }

  chipClassHA(d: DiaHorarioSemanaApi): string {
    const ha = (d.estado_hora_acumulada ?? 'NO').toUpperCase();
    if (ha === 'APROBADO') return 'chip-ok';
    if (ha === 'RECHAZADO') return 'chip-bad';
    if (ha === 'SOLICITUD') return 'chip-warn';
    return 'chip-muted';
  }

  chipClassJust(estado?: string | null): string {
    const s = (estado ?? 'NO').toUpperCase();
    if (s.includes('APRO')) return 'chip-ok';
    if (s.includes('RECH')) return 'chip-bad';
    if (s.includes('PEND')) return 'chip-warn';
    return 'chip-muted';
  }

  shortEstado(st: string) {
    switch (st) {
      case 'SOLICITUD':
        return 'SOL';
      case 'APROBADO':
      case 'APROBADA':
        return 'OK';
      case 'RECHAZADO':
      case 'RECHAZADA':
        return 'RECH';
      case 'PENDIENTE':
        return 'PENDIENTE';
      default:
        return st.length > 4 ? st.substring(0, 4) : st;
    }
  }

  // =========================
  // Permisos (igual lógica Flutter)
  // =========================
  isTodayYmd(ymd: string) {
    return this.isTodayObj(this.parseYmdLocal(ymd));
  }

  puedeEditar(d: DiaHorarioSemanaApi): boolean {
    const isToday = this.isTodayYmd(d.fecha);
    const tipo = (d.tipo_dia ?? 'NORMAL').toUpperCase().trim();
    return isToday && !!d.tiene_turno && tipo === 'NORMAL';
  }

  puedeSolicitarJustAtraso(d: DiaHorarioSemanaApi): boolean {
    if (!this.isTodayYmd(d.fecha)) return false; // ✅ solo HOY (regla del módulo)
    if (!d.id || !d.tiene_turno) return false;
    if ((d.tipo_dia ?? 'NORMAL').toUpperCase() !== 'NORMAL') return false;

    const est = (d.just_atraso_estado ?? 'NO').toUpperCase();
    return est === 'NO' || est.startsWith('RECH');
  }

  puedeSolicitarJustSalida(d: DiaHorarioSemanaApi): boolean {
    if (!this.isTodayYmd(d.fecha)) return false; // ✅ solo HOY
    if (!d.id || !d.tiene_turno) return false;
    if ((d.tipo_dia ?? 'NORMAL').toUpperCase() !== 'NORMAL') return false;

    const est = (d.just_salida_estado ?? 'NO').toUpperCase();
    return est === 'NO' || est.startsWith('RECH');
  }

  puedeEditarObsHA(d: DiaHorarioSemanaApi): boolean {
    const isToday = this.isTodayYmd(d.fecha);
    const tipo = (d.tipo_dia ?? 'NORMAL').toUpperCase().trim();
    const stHA = (d.estado_hora_acumulada ?? 'NO').toUpperCase().trim();
    return isToday && d.tiene_turno && tipo === 'NORMAL' && stHA !== 'APROBADO';
  }

  // =========================
  // Modal: abrir/cerrar
  // =========================
  abrirModalEditar(d: DiaHorarioSemanaApi) {
    this.diaEdit = d;

    // permisos
    this.puedeObsHA = this.puedeEditarObsHA(d);
    this.puedeJustA = this.puedeSolicitarJustAtraso(d);
    this.puedeJustS = this.puedeSolicitarJustSalida(d);

    // form init
    const obs = (d.observacion ?? '').trim();
    let haMin = this.haToMinutes(d.num_minutos_acumulados);
    if (haMin === 30) haMin = 60;
    if (haMin > 0 && haMin < 60) haMin = 60;
    if (haMin < 0) haMin = 0;
    if (haMin > 900) haMin = 900;
    haMin = Math.floor(haMin / 30) * 30;
    if (haMin === 30) haMin = 60;

    this.form = {
      obs,
      haMin,
      motAtraso: (d.just_atraso_motivo ?? '').trim(),
      motSalida: (d.just_salida_motivo ?? '').trim(),
    };

    this.modalOpen = true;
  }

  cerrarModal() {
    this.modalOpen = false;
    this.diaEdit = null;
  }

  // =========================
  // Stepper HA (0 -> 60 -> +30)
  // =========================
  haInc() {
    if (!this.puedeObsHA) return;
    const v = this.form.haMin;
    if (v <= 0) this.form.haMin = 60;
    else this.form.haMin = Math.min(900, v + 30);
  }

  haDec() {
    if (!this.puedeObsHA) return;
    const v = this.form.haMin;
    if (v <= 60) this.form.haMin = 0;
    else this.form.haMin = Math.max(0, v - 30);
  }

  // =========================
  // Guardar
  // =========================
  async guardarModal() {
    const d = this.diaEdit;
    if (!d) return;

    // Normalizar uppercase (como UpperCaseTextFormatter)
    this.form.obs = (this.form.obs ?? '').toUpperCase();
    this.form.motAtraso = (this.form.motAtraso ?? '').toUpperCase();
    this.form.motSalida = (this.form.motSalida ?? '').toUpperCase();

    // ✅ Validación: si solicita HA (haMin>0) obs >=5
    if (this.puedeObsHA && this.form.haMin > 0) {
      const motivo = (this.form.obs ?? '').trim();
      if (motivo.length < 5) {
        alert(
          'Motivo requerido: mínimo 5 caracteres para solicitar horas acumuladas.',
        );
        return;
      }
    }

    // ✅ Validación backend justificaciones: motivo >=5 si se envía
    if (this.puedeJustA) {
      const m = (this.form.motAtraso ?? '').trim();
      if (m && m.length < 5) {
        alert('Motivo atraso: mínimo 5 caracteres.');
        return;
      }
    }
    if (this.puedeJustS) {
      const m = (this.form.motSalida ?? '').trim();
      if (m && m.length < 5) {
        alert('Motivo turno incompleto: mínimo 5 caracteres.');
        return;
      }
    }

    this.cargando = true;
    try {
      // 1) Observación + HA (solo si permitido)
      if (this.puedeObsHA) {
        await this.srv.putObservacionTurnoHoy({
          observacion: (this.form.obs ?? '').trim() || null,
          solicitar_hora_acumulada: this.form.haMin > 0,
          num_minutos_acumulados: this.form.haMin > 0 ? this.form.haMin : null,
        });
      }

      // 2) Solicitar justificaciones (solo si permitido y hay texto)
      if (d.id) {
        if (this.puedeJustA) {
          const motivo = (this.form.motAtraso ?? '').trim();
          if (motivo.length >= 5) {
            await this.srv.postJustAtraso(d.id, motivo);
          }
        }

        if (this.puedeJustS) {
          const motivo = (this.form.motSalida ?? '').trim();
          if (motivo.length >= 5) {
            await this.srv.postJustSalida(d.id, motivo);
          }
        }
      }

      this.cerrarModal();
      await this.cargarSemanaPorFecha(this.selectedYmd);
    } catch (e) {
      console.error(e);
      alert('No se pudieron guardar los cambios.');
    } finally {
      this.cargando = false;
    }
  }

  // =========================
  // Formato / fechas
  // =========================
  diaTitulo(ymd: string) {
    const d = this.parseYmdLocal(ymd);
    return new Intl.DateTimeFormat('es-EC', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    })
      .format(d)
      .toUpperCase();
  }

  diaNombre(ymd: string) {
    const d = this.parseYmdLocal(ymd);
    return new Intl.DateTimeFormat('es-EC', { weekday: 'long' })
      .format(d)
      .toUpperCase();
  }

  fechaCorta(ymd: string) {
    const d = this.parseYmdLocal(ymd);
    return new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: 'short',
    }).format(d);
  }

  fechaUI(ymd: string) {
    const d = this.parseYmdLocal(ymd);
    return new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }

  hhmm(hm?: string | null) {
    if (!hm) return '-';
    return String(hm).slice(0, 5);
  }

  mmToHHMM(min: number) {
    const sign = min < 0 ? '-' : '';
    const abs = Math.abs(min);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  haToMinutes(v?: number | null) {
    const n = Number(v ?? 0);
    if (!n || n <= 0) return 0;
    if (n <= 15) return n * 60; // compat (horas enteras)
    return n; // ya minutos
  }

  private isBeforeHoraEntradaProgHoy(d: DiaHorarioSemanaApi): boolean {
    const prog = d.hora_entrada_prog ?? null;
    if (!prog) return false;
    const [hh, mm] = String(prog).split(':').map(Number);
    const progMin = (hh || 0) * 60 + (mm || 0);
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() < progMin;
  }

  private isTodayObj(d: Date): boolean {
    const t = new Date();
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  }

  private isFutureDayObj(d: Date): boolean {
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime() > today0.getTime();
  }

  private parseYmdLocal(ymd: string): Date {
    const [y, m, d] = (ymd ?? '').split('-').map((n) => Number(n));
    // 12:00 para evitar temas DST
    return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
  }

  private ymd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  }
}
