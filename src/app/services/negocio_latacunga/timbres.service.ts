// timbres.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimbreDto {
  lector_codigo: string;
  nombre?: string;
  sucursal?: string;
  tipo?: string; // MAESTRO / PRODUCCION...
  modo_actual?: 'PRODUCCION' | 'ENROLAMIENTO';
  usuario_enrolando_id?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class TimbresService {
  private http = inject(HttpClient);
  // 👇 Ajusta esta ruta según tu backend (ej: /biometrico/timbres, /timbres, etc.)
  private baseUrl = `${environment.API_URL}/timbres`;

  getAll(): Promise<TimbreDto[]> {
    return firstValueFrom(
      this.http.get<TimbreDto[]>(this.baseUrl, { withCredentials: true })
    );
  }
}
