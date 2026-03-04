import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ICajas,
  ApiListResp,
} from '../../interfaces/negocio/infraestructura/icajas.interface';

interface LatLngLiteral {
  lat: number;
  lng: number;
}

type ApiResp<T> = { success: boolean; message: string; data: T };

interface CreatePonNapResp {
  id: number;
  caja_nombre: string;
  caja_pon_id?: number;
  caja_pon_ruta?: string;
}

interface RutasDisponiblesResp {
  caja_id: number;
  capacidad: number;
  usadas: number;
  disponibles: string[];
}

interface DisponibilidadResp {
  caja_id: number;
  tipo: string;
  capacidad: number;
  usados: number;
  disponibles: number;
}

@Injectable({ providedIn: 'root' })
export class CajasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/cajas`;

  // ===== LEGACY (ya lo tienes) =====
  createCaja(dto: Partial<ICajas>) {
    return firstValueFrom(
      this.http.post<ApiResp<any>>(this.baseUrl, dto, {
        withCredentials: true,
      }),
    );
  }

  getCajas(params?: {
    ciudad?: string;
    tipo?: string;
    estado?: string;
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<ICajas[]> {
    let httpParams = new HttpParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '')
          httpParams = httpParams.set(k, String(v));
      }
    }
    return firstValueFrom(
      this.http.get<ApiListResp>(this.baseUrl, {
        params: httpParams,
        withCredentials: true,
      }),
    ).then((r) => r.data ?? []);
  }

  getCajasInBounds(
    ne: LatLngLiteral,
    sw: LatLngLiteral,
    extra?: {
      ciudad?: string;
      tipo?: string;
      estado?: string;
      q?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<ICajas[]> {
    let httpParams = new HttpParams()
      .set('ne', `${ne.lat},${ne.lng}`)
      .set('sw', `${sw.lat},${sw.lng}`);

    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (v !== undefined && v !== null && v !== '')
          httpParams = httpParams.set(k, String(v));
      }
    }

    return firstValueFrom(
      this.http.get<ApiListResp>(this.baseUrl, {
        params: httpParams,
        withCredentials: true,
      }),
    ).then((r) => r.data ?? []);
  }

  // ===== NUEVO: PON/NAP =====
  createPon(dto: Partial<ICajas>) {
    return firstValueFrom(
      this.http.post<ApiResp<CreatePonNapResp>>(`${this.baseUrl}/pon`, dto, {
        withCredentials: true,
      }),
    );
  }

  createNap(dto: Partial<ICajas>) {
    return firstValueFrom(
      this.http.post<ApiResp<CreatePonNapResp>>(`${this.baseUrl}/nap`, dto, {
        withCredentials: true,
      }),
    );
  }

  getRutasDisponibles(ponId: number) {
    return firstValueFrom(
      this.http.get<ApiResp<RutasDisponiblesResp>>(
        `${this.baseUrl}/${ponId}/rutas-disponibles`,
        { withCredentials: true },
      ),
    );
  }

  getDisponibilidad(cajaId: number) {
    return firstValueFrom(
      this.http.get<ApiResp<DisponibilidadResp>>(
        `${this.baseUrl}/${cajaId}/disponibilidad`,
        { withCredentials: true },
      ),
    );
  }

  addSplitter(cajaId: number, payload: { path: string; factor: 2 | 8 | 16 }) {
    return firstValueFrom(
      this.http.post<ApiResp<any>>(
        `${this.baseUrl}/${cajaId}/splitters`,
        payload,
        { withCredentials: true },
      ),
    );
  }

  // GET /cajas/:id
  getCajaById(id: number): Promise<ICajas> {
    return firstValueFrom(
      this.http.get<{ success: boolean; message: string; data: ICajas }>(
        `${this.baseUrl}/${id}`,
        { withCredentials: true },
      ),
    ).then((r) => r.data);
  }
}
