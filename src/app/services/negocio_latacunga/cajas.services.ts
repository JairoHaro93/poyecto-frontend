// src/app/services/negocio_latacunga/cajas.services.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ICajas } from '../../interfaces/negocio/infraestructura/icajas.interface';

interface CreateCajaResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    caja_tipo: string;
    caja_nombre: string;
    caja_estado: string;
    caja_hilo?: string;
    caja_coordenadas?: string; // ⬅️ importante
  };
}

@Injectable({ providedIn: 'root' })
export class CajasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/cajas`;

  createCaja(dto: Partial<ICajas>) {
    return firstValueFrom(
      this.http.post<CreateCajaResponse>(`${this.baseUrl}`, dto)
    );
  }
}
