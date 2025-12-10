// src/app/services/negocio_latacunga/turnos.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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

export interface ITurnoDiario {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  usuario_usuario: string;
  usuario_cedula: string;
  fecha: string; // 'YYYY-MM-DD'
  sucursal: string | null;
  hora_entrada_prog: string | null;
  hora_salida_prog: string | null;
  hora_entrada_real: string | null;
  hora_salida_real: string | null;
  min_trabajados: number | null;
  min_atraso: number | null;
  min_extra: number | null;
  estado_asistencia: string;
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

  // Campos de JOIN de usuario:
  usuario_nombre: string;
  usuario_usuario: string;
  usuario_cedula: string;
}

export interface GetTurnosResponse {
  ok: boolean;
  turnos: TurnoDiario[];
}

@Injectable({ providedIn: 'root' })
export class TurnosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/turnos`;

  generarTurnos(payload: GenerarTurnosPayload): Promise<GenerarTurnosResponse> {
    const obs = this.http.post<GenerarTurnosResponse>(
      `${this.baseUrl}/generar`,
      payload,
      { withCredentials: true }
    );
    return firstValueFrom(obs);
  }

  getTurnos(params: {
    sucursal?: string | null;
    fecha_desde?: string | null;
    fecha_hasta?: string | null;
    usuario_id?: number;
  }): Promise<GetTurnosResponse> {
    let httpParams = new HttpParams();

    if (params.sucursal) {
      httpParams = httpParams.set('sucursal', params.sucursal);
    }
    if (params.fecha_desde) {
      httpParams = httpParams.set('fecha_desde', params.fecha_desde);
    }
    if (params.fecha_hasta) {
      httpParams = httpParams.set('fecha_hasta', params.fecha_hasta);
    }
    if (params.usuario_id) {
      httpParams = httpParams.set('usuario_id', String(params.usuario_id));
    }

    const obs = this.http.get<GetTurnosResponse>(this.baseUrl, {
      params: httpParams,
      withCredentials: true,
    });

    return firstValueFrom(obs);
  }

  actualizarTurno(id: number, data: Partial<TurnoDiario>): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.baseUrl}/${id}`, data, {
        withCredentials: true,
      })
    );
  }

  eliminarTurno(id: number): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${this.baseUrl}/${id}`, {
        withCredentials: true,
      })
    );
  }

  // 🔹 NUEVO: listar turnos
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
    if (params.usuario_id) {
      httpParams = httpParams.set('usuario_id', String(params.usuario_id));
    }

    const obs = this.http.get<{ ok: boolean; turnos: ITurnoDiario[] }>(
      this.baseUrl,
      {
        params: httpParams,
        withCredentials: true,
      }
    );

    const resp = await firstValueFrom(obs);
    return resp.turnos || [];
  }
}
