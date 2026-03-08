import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type NapClienteEvento =
  | 'ASIGNACION'
  | 'LIBERACION'
  | 'REEMPLAZO_ONT'
  | 'ACTUALIZACION';

export interface INapClienteControlDetalle {
  napId?: number | null;
  napNombre?: string | null;
  puerto?: number | null;
  onu?: string | null;
  createdAt?: string | null;
  createdBy?: number | null;
  createdByNombre?: string | null;
}

export interface INapClienteLookupItem {
  ord_ins: number;
  onu: string;
  bloqueadoPorOrdIns?: boolean;
  bloqueadoPorOnu?: boolean;
  detalle?: INapClienteControlDetalle | null;
}

export interface INapClienteLookupPayload {
  ord_ins_list: number[];
  onu_list: string[];
}

export interface INapClienteLookupResponse {
  ok: boolean;
  items: INapClienteLookupItem[];
}

export interface INapClienteAsignacionActual {
  id: number;
  nap_id: number;
  nap_nombre?: string | null;
  puerto: number;
  ord_ins: number;
  onu: string;
  observacion?: string | null;
  created_at?: string | null;
  created_by?: number | null;
  created_by_nombre?: string | null;
  updated_at?: string | null;
  updated_by?: number | null;
  updated_by_nombre?: string | null;
}

export interface INapClienteAsignacionResponse {
  ok: boolean;
  data: INapClienteAsignacionActual | null;
}

export interface INapClienteCrearPayload {
  nap_id: number;
  puerto?: number | null;
  ord_ins: number;
  onu: string;
  observacion?: string | null;
}

export interface INapClienteCrearResponse {
  ok: boolean;
  data: INapClienteAsignacionActual;
  message?: string;
}

export interface INapClienteLiberarPayload {
  motivo?: string | null;
  observacion?: string | null;
}

export interface INapClienteLiberarResponse {
  ok: boolean;
  message?: string;
  data?: {
    id: number;
    ord_ins: number;
    onu: string;
    nap_id: number;
    puerto: number;
  };
}

export interface INapClienteHistorialItem {
  id: number;
  tipo_evento: NapClienteEvento;
  nap_cliente_id_ref?: number | null;
  nap_id?: number | null;
  nap_nombre?: string | null;
  puerto?: number | null;
  ord_ins?: number | null;
  onu?: string | null;
  nap_id_origen?: number | null;
  nap_nombre_origen?: string | null;
  puerto_origen?: number | null;
  nap_id_destino?: number | null;
  nap_nombre_destino?: string | null;
  puerto_destino?: number | null;
  motivo?: string | null;
  observacion?: string | null;
  created_at?: string | null;
  created_by?: number | null;
  created_by_nombre?: string | null;
}

export interface INapClienteHistorialResponse {
  ok: boolean;
  items: INapClienteHistorialItem[];
}

@Injectable({
  providedIn: 'root',
})
export class NapClientesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/nap-clientes`;

  lookupServiciosControl(payload: INapClienteLookupPayload) {
    return lastValueFrom(
      this.http.post<INapClienteLookupResponse>(
        `${this.baseUrl}/lookup-servicios-control`,
        payload,
        { withCredentials: true },
      ),
    );
  }

  getAsignacionActualByOrdIns(ordIns: number) {
    return lastValueFrom(
      this.http.get<INapClienteAsignacionResponse>(
        `${this.baseUrl}/asignacion/ord-ins/${ordIns}`,
        { withCredentials: true },
      ),
    );
  }

  getAsignacionActualByOnu(onu: string) {
    return lastValueFrom(
      this.http.get<INapClienteAsignacionResponse>(
        `${this.baseUrl}/asignacion/onu/${encodeURIComponent(onu)}`,
        { withCredentials: true },
      ),
    );
  }

  crearAsignacion(payload: INapClienteCrearPayload) {
    return lastValueFrom(
      this.http.post<INapClienteCrearResponse>(
        `${this.baseUrl}/asignacion`,
        payload,
        { withCredentials: true },
      ),
    );
  }

  liberarAsignacionById(id: number, payload: INapClienteLiberarPayload = {}) {
    return lastValueFrom(
      this.http.post<INapClienteLiberarResponse>(
        `${this.baseUrl}/asignacion/${id}/liberar`,
        payload,
        { withCredentials: true },
      ),
    );
  }

  liberarAsignacionByOrdIns(
    ordIns: number,
    payload: INapClienteLiberarPayload = {},
  ) {
    return lastValueFrom(
      this.http.post<INapClienteLiberarResponse>(
        `${this.baseUrl}/asignacion/ord-ins/${ordIns}/liberar`,
        payload,
        { withCredentials: true },
      ),
    );
  }

  getHistorial(params?: { ord_ins?: number; onu?: string; nap_id?: number }) {
    let httpParams = new HttpParams();

    if (params?.ord_ins) {
      httpParams = httpParams.set('ord_ins', String(params.ord_ins));
    }
    if (params?.onu) {
      httpParams = httpParams.set('onu', params.onu);
    }
    if (params?.nap_id) {
      httpParams = httpParams.set('nap_id', String(params.nap_id));
    }

    return lastValueFrom(
      this.http.get<INapClienteHistorialResponse>(`${this.baseUrl}/historial`, {
        params: httpParams,
        withCredentials: true,
      }),
    );
  }
}
