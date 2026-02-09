// src/app/services/negocio_latacunga/cajas.services.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ICajas,
  ApiListResp,
} from '../../interfaces/negocio/infraestructura/icajas.interface';

// Para no depender de types de Google en este servicio:
interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface CreateCajaResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    caja_tipo: string;
    caja_nombre: string;
    caja_estado: string;
    caja_hilo?: string;
    caja_coordenadas?: string;
    caja_ciudad?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CajasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/cajas`; // p.ej: /api/negocio_lat/cajas

  // ========== CREATE ==========
  createCaja(dto: Partial<ICajas>) {
    return firstValueFrom(
      this.http.post<CreateCajaResponse>(this.baseUrl, dto)
    );
    // Si prefieres devolver directo data (y cambiar tu componente):
    // return firstValueFrom(this.http.post<CreateCajaResponse>(this.baseUrl, dto))
    //   .then(r => r.data);
  }

  // ========== LISTA SIMPLE ==========
  getCajas(params?: {
    ciudad?: string; // 'LATACUNGA' | 'SALCEDO'
    tipo?: string; // 'PON' | 'NAP'
    estado?: string; // 'DISEÑO' | 'ACTIVO'
    q?: string; // búsqueda libre
    limit?: number;
    offset?: number;
  }): Promise<ICajas[]> {
    let httpParams = new HttpParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      }
    }
    return firstValueFrom(
      this.http.get<ApiListResp>(this.baseUrl, { params: httpParams })
    ).then((r) => r.data ?? []);
  }

  // ========== LISTA POR VIEWPORT (bbox) ==========
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
    }
  ): Promise<ICajas[]> {
    let httpParams = new HttpParams()
      .set('ne', `${ne.lat},${ne.lng}`)
      .set('sw', `${sw.lat},${sw.lng}`);

    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      }
    }

   // console.log('[CajasService] GET /cajas params', httpParams.toString()); // DEBUG 👈

    return firstValueFrom(
      this.http.get<ApiListResp>(this.baseUrl, { params: httpParams })
    ).then((r) => r.data ?? []);
  }
}
