import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HuellaActivaDto {
  huella_id: number;
  usuario_id: number;
  lector_codigo: string;
  finger_id: number;
  slot: number;
  estado: string;
  usuario_nombre: string;
  usuario_apellido: string;
  usuario_usuario: string;
  usuario_cedula: string;
}

export interface HuellasPorTimbreResponse {
  ok: boolean;
  lector_codigo: string;
  total: number;
  huellas: HuellaActivaDto[];
}

@Injectable({ providedIn: 'root' })
export class HuellasService {
  // Ajusta esta base según tu environment (apiUrl, baseUrl, etc.)
  private baseUrl = `${environment.API_URL}/huellas`;

  constructor(private http: HttpClient) {}

  getHuellasActivasPorTimbre(
    lector_codigo: string
  ): Promise<HuellasPorTimbreResponse> {
    const url = `${this.baseUrl}/${encodeURIComponent(lector_codigo)}`;
    return lastValueFrom(this.http.get<HuellasPorTimbreResponse>(url));
  }

  deleteUsuarioDelTimbre(
    lector_codigo: string,
    usuario_id: number
  ): Promise<any> {
    const url = `${this.baseUrl}/${encodeURIComponent(
      lector_codigo
    )}/usuario/${usuario_id}`;
    return lastValueFrom(this.http.delete(url));
  }
}
