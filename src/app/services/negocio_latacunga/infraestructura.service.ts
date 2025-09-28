import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface CreateInfraDto {
  nombre: string;
  coordenadas: string;
  observacion: string;
}

@Injectable({
  providedIn: 'root',
})
export class InfraestructuraService {
  private baseUrl: string = `${environment.API_URL}`;
  private httpClient = inject(HttpClient);

  async createInfra(payload: CreateInfraDto) {
    const url = `${this.baseUrl}/infraestructura`;
    return await lastValueFrom(
      this.httpClient.post<{ ok?: boolean; id: number; data?: any }>(
        url,
        payload,
        {
          withCredentials: true, // 👈 igual que tu método que sí funciona
        }
      )
    );
  }

  async uploadInfraImage(params: {
    id: number;
    campo: 'img_ref1' | 'img_ref2';
    file: File;
  }) {
    const fd = new FormData();
    fd.append('tabla', 'neg_t_infraestructura');
    fd.append('id', String(params.id));
    fd.append('campo', params.campo);
    fd.append('directorio', String(params.id));
    fd.append('imagen', params.file);

    const url = `${this.baseUrl}/imagenes/upload`;
    return await lastValueFrom(
      this.httpClient.post(url, fd, { withCredentials: true }) // 👈 también con credenciales
    );
  }
}
