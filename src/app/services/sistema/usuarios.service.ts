// usuarios.services.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Iusuarios } from '../../interfaces/sistema/iusuarios.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private baseUrl: string = `${environment.API_URL}/usuarios`;
  private httpClient = inject(HttpClient);

  getAll() {
    return lastValueFrom(
      this.httpClient.get<Iusuarios[]>(this.baseUrl, {
        withCredentials: true,
      })
    );
  }

  getAllAgendaTecnicos() {
    return lastValueFrom(
      this.httpClient.get<Iusuarios[]>(`${this.baseUrl}/agenda-tecnicos`, {
        withCredentials: true,
      })
    );
  }

  getbyId(id: string): Promise<Iusuarios> {
    return firstValueFrom(
      this.httpClient.get<Iusuarios>(`${this.baseUrl}/${id}`, {
        withCredentials: true,
      })
    );
  }

  update(body: Iusuarios): Promise<Iusuarios> {
    const id = body.id;
    delete body.id;

    return firstValueFrom(
      this.httpClient.put<Iusuarios>(`${this.baseUrl}/${id}`, body, {
        withCredentials: true,
      })
    );
  }

  insert(body: Iusuarios): Promise<Iusuarios> {
    return firstValueFrom(
      this.httpClient.post<Iusuarios>(this.baseUrl, body, {
        withCredentials: true,
      })
    );
  }

  delete(id: number): Promise<Iusuarios> {
    return firstValueFrom(
      this.httpClient.delete<Iusuarios>(`${this.baseUrl}/${id}`, {
        withCredentials: true,
      })
    );
  }

  /** 🔹 NUEVO: lista filtrada para módulo de turnos */
  // usuarios.services.ts
  // src/app/services/sistema/usuarios.service.ts
  getParaTurnos(departamentoId?: number): Promise<Iusuarios[]> {
    // Construimos params solo si hay departamentoId
    const params: any = {};
    if (departamentoId != null) {
      params.departamento_id = departamentoId;
    }

    return firstValueFrom(
      this.httpClient.get<Iusuarios[]>(`${this.baseUrl}/para-turnos`, {
        withCredentials: true,
        params,
      })
    );
  }
}
