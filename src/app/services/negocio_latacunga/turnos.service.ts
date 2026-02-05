// src/app/services/negocio_latacunga/turnos.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GenerarTurnosPayload {
  usuario_ids: number[];
  fecha_desde: string;
  fecha_hasta: string;
  sucursal: string;
  hora_entrada_prog: string;
  hora_salida_prog: string;
  min_toler_atraso: number;
  min_toler_salida: number;
  excluir_fines_semana: boolean;
}

export interface GenerarTurnosResponse {
  ok: boolean;
  message: string;
  totalIntentos: number;
  totalInsertados: number;
  totalOmitidos: number;
}

// ✅ Turno que consume Horarios (puede incluir campos extra que vienen de backend)
export interface ITurnoDiario {
  id: number;
  usuario_id: number;
  fecha: string;

  estado_asistencia?: string;
  hora_entrada_prog?: any;
  hora_salida_prog?: any;
  hora_entrada_real?: any;
  hora_salida_real?: any;

  min_trabajados?: number;
  min_atraso?: number;
  min_extra?: number;

  sucursal?: string;

  // ✅ "observacion" la dejaste para horas acumuladas (de momento)
  observacion?: string;

  // ✅ HORAS ACUMULADAS
  estado_hora_acumulada?: string; // NO | SOLICITUD | APROBADO | RECHAZADO
  num_minutos_acumulados?: number | null;
  hora_acum_aprobado_por?: number | null;

  // ✅ Campos de JUSTIFICACIONES (solo datos, sin endpoints aquí)
  // (útiles para mostrar badges/estado en la matriz)
  just_atraso_estado?: string; // NO | PENDIENTE | APROBADA | RECHAZADA
  just_atraso_motivo?: string | null;
  just_atraso_minutos?: number | null;
  just_atraso_jefe_id?: number | null;

  just_salida_estado?: string; // NO | PENDIENTE | APROBADA | RECHAZADA
  just_salida_motivo?: string | null;
  just_salida_minutos?: number | null;
  just_salida_jefe_id?: number | null;
}

export interface TurnoDiario {
  id: number;
  usuario_id: number;
  fecha: string;
  sucursal: string | null;

  hora_entrada_prog: string | null;
  hora_salida_prog: string | null;

  min_toler_atraso: number;
  min_toler_salida: number;

  estado_asistencia: string;

  // JOIN usuario
  usuario_nombre: string;
  usuario_usuario: string;
  usuario_cedula: string;
}

export interface GetTurnosResponse {
  ok: boolean;
  turnos: TurnoDiario[];
  filtros?: any;
}

@Injectable({ providedIn: 'root' })
export class TurnosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/turnos`;

  // ==========================
  //  GENERAR TURNOS
  // ==========================
  generarTurnos(payload: GenerarTurnosPayload): Promise<GenerarTurnosResponse> {
    return firstValueFrom(
      this.http.post<GenerarTurnosResponse>(
        `${this.baseUrl}/generar`,
        payload,
        {
          withCredentials: true,
        },
      ),
    );
  }

  // ==========================
  //  GET TURNOS (RAW)
  // ==========================
  getTurnos(params: {
    sucursal?: string | null;
    fecha_desde?: string | null;
    fecha_hasta?: string | null;
    usuario_id?: number;
  }): Promise<GetTurnosResponse> {
    let httpParams = new HttpParams();

    if (params.sucursal)
      httpParams = httpParams.set('sucursal', params.sucursal);
    if (params.fecha_desde)
      httpParams = httpParams.set('fecha_desde', params.fecha_desde);
    if (params.fecha_hasta)
      httpParams = httpParams.set('fecha_hasta', params.fecha_hasta);
    if (params.usuario_id)
      httpParams = httpParams.set('usuario_id', String(params.usuario_id));

    return firstValueFrom(
      this.http.get<GetTurnosResponse>(this.baseUrl, {
        params: httpParams,
        withCredentials: true,
      }),
    );
  }

  // ==========================
  //  CRUD PROGRAMACIÓN
  // ==========================
  actualizarTurno(id: number, data: Partial<TurnoDiario>): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.baseUrl}/${id}`, data, { withCredentials: true }),
    );
  }

  eliminarTurno(id: number): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${this.baseUrl}/${id}`, { withCredentials: true }),
    );
  }

  // ==========================
  //  LISTAR TURNOS (PARA HORARIOS)
  // ==========================
  async listarTurnos(params: {
    sucursal?: string | null;
    fecha_desde?: string | null;
    fecha_hasta?: string | null;
    usuario_id?: number | null;
  }): Promise<ITurnoDiario[]> {
    let httpParams = new HttpParams();

    if (params.sucursal)
      httpParams = httpParams.set('sucursal', params.sucursal);
    if (params.fecha_desde)
      httpParams = httpParams.set('fecha_desde', params.fecha_desde);
    if (params.fecha_hasta)
      httpParams = httpParams.set('fecha_hasta', params.fecha_hasta);
    if (params.usuario_id)
      httpParams = httpParams.set('usuario_id', String(params.usuario_id));

    const resp = await firstValueFrom(
      this.http.get<{ ok: boolean; turnos: ITurnoDiario[]; filtros?: any }>(
        this.baseUrl,
        { params: httpParams, withCredentials: true },
      ),
    );

    return resp.turnos || [];
  }

  // ==========================
  //  APROBAR / RECHAZAR HORAS ACUMULADAS
  //  PUT /api/turnos/hora-acumulada/:turnoId
  // ==========================
  actualizarEstadoHoraAcumulada(
    turnoId: number,
    data:
      | 'APROBADO'
      | 'RECHAZADO'
      | {
          estado_hora_acumulada: 'APROBADO' | 'RECHAZADO';
          hora_acum_aprobado_por?: number;
        },
  ) {
    const body =
      typeof data === 'string' ? { estado_hora_acumulada: data } : data;

    return lastValueFrom(
      this.http.put(`${this.baseUrl}/hora-acumulada/${turnoId}`, body, {
        withCredentials: true,
      }),
    );
  }

  // ==========================
  //  ASIGNAR DEVOLUCIÓN (cuando corresponda)
  //  PUT /api/turnos/devolucion/:turnoId
  // ==========================
  asignarDevolucion(turnoId: number): Promise<any> {
    return lastValueFrom(
      this.http.put(
        `${this.baseUrl}/devolucion/${turnoId}`,
        {},
        { withCredentials: true },
      ),
    );
  }
}
