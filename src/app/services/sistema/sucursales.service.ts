// src/app/services/sistema/sucursales.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ISucursal } from '../../interfaces/sistema/isucursal.interface';

@Injectable({ providedIn: 'root' })
export class SucursalesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/sucursales`;
  // 👆 Ajusta si tu backend expone otra ruta, ej: /sistema/sucursales

  async getAll(): Promise<ISucursal[]> {
    const obs = this.http.get<ISucursal[]>(this.baseUrl, {
      withCredentials: true,
    });
    return await firstValueFrom(obs);
  }

  async getById(id: number | string): Promise<ISucursal> {
    const obs = this.http.get<ISucursal>(`${this.baseUrl}/${id}`, {
      withCredentials: true,
    });
    return await firstValueFrom(obs);
  }

  async create(data: Partial<ISucursal>): Promise<ISucursal> {
    const obs = this.http.post<ISucursal>(this.baseUrl, data, {
      withCredentials: true,
    });
    return await firstValueFrom(obs);
  }

  async update(
    id: number | string,
    data: Partial<ISucursal>
  ): Promise<ISucursal> {
    const obs = this.http.put<ISucursal>(`${this.baseUrl}/${id}`, data, {
      withCredentials: true,
    });
    return await firstValueFrom(obs);
  }

  async delete(id: number | string): Promise<void> {
    const obs = this.http.delete<void>(`${this.baseUrl}/${id}`, {
      withCredentials: true,
    });
    await firstValueFrom(obs);
  }
}
