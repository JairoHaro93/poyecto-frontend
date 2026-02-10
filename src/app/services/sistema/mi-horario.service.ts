import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DiaHorarioSemanaApi {
  id: number | null;
  fecha: string; // YYYY-MM-DD
  tiene_turno: boolean;

  hora_entrada_prog?: string | null; // HH:mm / HH:mm:ss
  hora_salida_prog?: string | null; // HH:mm / HH:mm:ss

  // backend puede devolver DATETIME (string)
  hora_entrada_real?: string | null;
  hora_salida_real?: string | null;

  estado_asistencia: string; // SIN_TURNO|SIN_MARCA|OK|ATRASO|INCOMPLETO...
  tipo_dia: string; // NORMAL|VACACIONES|PERMISO|DEVOLUCION

  min_trabajados?: number | null;
  min_atraso?: number | null;
  min_salida_temprana?: number | null;

  observacion?: string | null;
  sucursal?: string | null;

  // Horas acumuladas
  estado_hora_acumulada: string; // NO|SOLICITUD|APROBADO|RECHAZADO
  num_minutos_acumulados?: number | null;

  // Justificaciones
  just_atraso_estado?: string | null; // NO|PENDIENTE|APROBADA|RECHAZADA
  just_atraso_motivo?: string | null;

  just_salida_estado?: string | null;
  just_salida_motivo?: string | null;

  // ✅ Flags calculadas (vienen del SQL)
  atraso_si?: any;
  salida_temprana_si?: any;
  almuerzo_excedido_si?: any;
}

export interface MiHorarioSemanaResponseApi {
  success: boolean;
  desde: string;
  hasta: string;
  total_horas_acumuladas_min: number;
  vacaciones_disponibles_dias: number;
  data: DiaHorarioSemanaApi[];
}

@Injectable({ providedIn: 'root' })
export class MiHorarioService {
  private baseTurnos = `${environment.API_URL}/turnos`;

  constructor(private http: HttpClient) {}

  getMiHorarioSemana(fechaYmd: string) {
    return firstValueFrom(
      this.http.get<MiHorarioSemanaResponseApi>(
        `${this.baseTurnos}/mi-horario?fecha=${encodeURIComponent(fechaYmd)}`,
        { withCredentials: true },
      ),
    );
  }

  putObservacionTurnoHoy(payload: {
    observacion: string | null;
    solicitar_hora_acumulada: boolean;
    num_minutos_acumulados: number | null; // 60..900 step 30 o null
  }) {
    return firstValueFrom(
      this.http.put(`${this.baseTurnos}/mi-horario/observacion`, payload, {
        withCredentials: true,
      }),
    );
  }

  postJustAtraso(turnoId: number, motivo: string) {
    return firstValueFrom(
      this.http.post(
        `${environment.API_URL}/justificacion/${turnoId}/justificaciones/atraso`,
        { motivo },
        { withCredentials: true },
      ),
    );
  }

  postJustSalida(turnoId: number, motivo: string) {
    return firstValueFrom(
      this.http.post(
        `${environment.API_URL}/justificacion/${turnoId}/justificaciones/salida`,
        { motivo },
        { withCredentials: true },
      ),
    );
  }
}
