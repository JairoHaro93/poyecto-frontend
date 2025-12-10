// src/app/services/sistema/departamentos.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IDepartamento } from '../../interfaces/sistema/idepartamento.interface';

@Injectable({ providedIn: 'root' })
export class DepartamentosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/departamentos`;
  // 👆 Ajusta si tu backend expone otra ruta, ej: /sistema/departamentos

  async getAll(): Promise<IDepartamento[]> {
    const obs = this.http.get<IDepartamento[]>(this.baseUrl, {
      withCredentials: true,
    });
    return await firstValueFrom(obs);
  }

  async getById(id: number | string): Promise<IDepartamento> {
    const obs = this.http.get<IDepartamento>(`${this.baseUrl}/${id}`, {
      withCredentials: true,
    });
    return await firstValueFrom(obs);
  }

  async create(data: Partial<IDepartamento>): Promise<IDepartamento> {
    const obs = this.http.post<IDepartamento>(this.baseUrl, data, {
      withCredentials: true,
    });
    return await firstValueFrom(obs);
  }

  async update(
    id: number | string,
    data: Partial<IDepartamento>
  ): Promise<IDepartamento> {
    const obs = this.http.put<IDepartamento>(`${this.baseUrl}/${id}`, data, {
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
