import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HoraExtraPendiente {
  id: number;
  usuario_id: number;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:mm:ss
  hora_fin: string; // HH:mm:ss
  minutos: number;
  observacion: string | null;
  estado: 'SOLICITUD' | 'APROBADO' | 'RECHAZADO' | 'ANULADO';
  solicitado_at: string; // datetime
  usuario_nombre: string;
  sucursal_id: number | null;
  departamento_id: number | null;
}

/**
 * ✅ Aprobadas salen desde movimientos (CREDITO/HORA_EXTRA/APROBADO)
 * La idea es que el backend devuelva:
 * - usuario_id, usuario_nombre (join opcional)
 * - fecha, minutos, observacion, created_at
 * - id (id del movimiento)
 */
export interface HoraExtraAprobadaMov {
  id: number; // id del movimiento
  usuario_id: number;
  usuario_nombre?: string; // si backend hace join
  fecha: string; // YYYY-MM-DD
  minutos: number;
  observacion?: string | null;
  created_at?: string | null;
}

type ListResp<T> = T[] | { data?: T[] };

@Injectable({ providedIn: 'root' })
export class HorasExtrasService {
  private baseUrl = `${environment.API_URL}/horas-extra`;

  constructor(private http: HttpClient) {}

  private unwrapArray<T>(resp: ListResp<T>): T[] {
    if (Array.isArray(resp)) return resp;
    if (resp && Array.isArray((resp as any).data))
      return (resp as any).data as T[];
    return [];
  }

  // ✅ PENDIENTES por MES (ym=YYYY-MM)
  listarPendientesPorMes(ym: string): Promise<HoraExtraPendiente[]> {
    return firstValueFrom(
      this.http.get<ListResp<HoraExtraPendiente>>(
        `${this.baseUrl}/pendientes`,
        {
          withCredentials: true,
          params: { ym },
        },
      ),
    ).then((resp) => this.unwrapArray(resp));
  }

  // ✅ APROBADAS desde MOVIMIENTOS por MES (ym=YYYY-MM)
  listarAprobadasMovPorMes(ym: string): Promise<HoraExtraAprobadaMov[]> {
    return firstValueFrom(
      this.http.get<ListResp<HoraExtraAprobadaMov>>(
        `${this.baseUrl}/aprobadas`,
        {
          withCredentials: true,
          params: { ym },
        },
      ),
    ).then((resp) => this.unwrapArray(resp));
  }

  aprobar(id: number): Promise<any> {
    return firstValueFrom(
      this.http.put(
        `${this.baseUrl}/solicitudes/${id}/aprobar`,
        {},
        { withCredentials: true },
      ),
    );
  }

  rechazar(id: number, motivo_rechazo: string): Promise<any> {
    return firstValueFrom(
      this.http.put(
        `${this.baseUrl}/solicitudes/${id}/rechazar`,
        { motivo_rechazo },
        { withCredentials: true },
      ),
    );
  }
}
