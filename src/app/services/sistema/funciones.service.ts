import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FuncionesService {
  private baseUrl: string = `${environment.API_URL}/funciones`;
  private httpClient = inject(HttpClient);

  // Obtener todas las funciones
  getAll() {
    return lastValueFrom(
      this.httpClient.get<[]>(this.baseUrl, {
        withCredentials: true, // ✅ importante para enviar cookie
      })
    );
  }

  // Obtener funciones por ID de usuario
  getbyId(id: string) {
    return firstValueFrom(
      this.httpClient.get<[]>(`${this.baseUrl}/${id}`, {
        withCredentials: true, // ✅ importante para enviar cookie
      })
    );
  }
}
