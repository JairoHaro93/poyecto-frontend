import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VacConfig {
  id: number;
  fecha_corte: string; // YYYY-MM-DD
  dias_base: number;
  extra_desde_anio: number;
  extra_max: number;
}

export interface VacResumenUsuario {
  usuario_id: number;
  fecha_corte: string;
  generados_hoy: number;
  consumido_inicial: number;
  consumido_asignaciones: number;
  saldo_real: number;
  saldo_visible: number;
  deuda: number;
}

export interface VacPreviewResponse {
  dias_calendario: number;
  saldo: {
    saldo_real_antes: number;
    saldo_real_despues: number;
    saldo_visible_antes: number;
    saldo_visible_despues: number;
    deuda_despues: number;
  };
}

export interface VacAsignacion {
  id: number;
  usuario_id: number;
  jefe_id: number;
  fecha_desde: string;
  fecha_hasta: string;
  dias_calendario: number;
  estado: 'ACTIVA' | 'ANULADA';
  observacion?: string | null;
  created_at?: string;

  jefe_nombre?: string | null;
  acta_file_id?: number | null;
}

@Injectable({ providedIn: 'root' })
export class VacacionesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/vacaciones`;

  getConfig(): Promise<VacConfig> {
    return firstValueFrom(
      this.http.get<VacConfig>(`${this.baseUrl}/config`, {
        withCredentials: true,
      })
    );
  }

  // Trabajador (Flutter o web si quisieras)
  getMiSaldo(): Promise<{ saldo_visible: number }> {
    return firstValueFrom(
      this.http.get<{ saldo_visible: number }>(`${this.baseUrl}/mi-saldo`, {
        withCredentials: true,
      })
    );
  }

  // Jefe
  getResumenUsuario(usuarioId: number): Promise<VacResumenUsuario> {
    return firstValueFrom(
      this.http.get<VacResumenUsuario>(
        `${this.baseUrl}/resumen/usuario/${usuarioId}`,
        {
          withCredentials: true,
        }
      )
    );
  }

  preview(payload: {
    usuario_id: number;
    fecha_desde: string;
    fecha_hasta: string;
  }): Promise<VacPreviewResponse> {
    return firstValueFrom(
      this.http.post<VacPreviewResponse>(
        `${this.baseUrl}/asignaciones/preview`,
        payload,
        {
          withCredentials: true,
        }
      )
    );
  }

  crear(payload: {
    usuario_id: number;
    fecha_desde: string;
    fecha_hasta: string;
    observacion?: string | null;
  }): Promise<{
    id: number;
    estado: string;
    dias_calendario: number;
    saldos: any;
    acta?: { file_id: number; download_url: string };
  }> {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/asignaciones`, payload, {
        withCredentials: true,
      })
    );
  }

  listarAsignaciones(params: {
    usuario_id: number;
    estado?: 'TODAS' | 'ACTIVA' | 'ANULADA';
    limit?: number;
    offset?: number;
  }): Promise<VacAsignacion[]> {
    let httpParams = new HttpParams().set(
      'usuario_id',
      String(params.usuario_id)
    );
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.limit != null)
      httpParams = httpParams.set('limit', String(params.limit));
    if (params.offset != null)
      httpParams = httpParams.set('offset', String(params.offset));

    return firstValueFrom(
      this.http.get<VacAsignacion[]>(`${this.baseUrl}/asignaciones`, {
        params: httpParams,
        withCredentials: true,
      })
    );
  }

  anular(asignacionId: number, motivo: string): Promise<any> {
    return firstValueFrom(
      this.http.post(
        `${this.baseUrl}/asignaciones/${asignacionId}/anular`,
        { motivo },
        { withCredentials: true }
      )
    );
  }

  getActa(
    asignacionId: number
  ): Promise<{ file_id: number; download_url: string }> {
    return firstValueFrom(
      this.http.get<{ file_id: number; download_url: string }>(
        `${this.baseUrl}/asignaciones/${asignacionId}/acta`,
        {
          withCredentials: true,
        }
      )
    );
  }
}
