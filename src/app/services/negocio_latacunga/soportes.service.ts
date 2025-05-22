import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Isoportes } from '../../interfaces/negocio/soportes/isoportes.interface';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SoportesService {
  private baseUrl: string = `${environment.API_URL}/soportes`;
  private httpClient = inject(HttpClient);

  getAll(): Promise<Isoportes[]> {
    return lastValueFrom(
      this.httpClient.get<Isoportes[]>(this.baseUrl, {
        withCredentials: true,
      })
    );
  }

  getAllPendientes(): Promise<Isoportes[]> {
    return lastValueFrom(
      this.httpClient.get<Isoportes[]>(`${this.baseUrl}/pendientes`, {
        withCredentials: true,
      })
    );
  }

  getSopById(id_sop: number): Promise<Isoportes> {
    return firstValueFrom(
      this.httpClient.get<Isoportes>(`${this.baseUrl}/${id_sop}`, {
        withCredentials: true,
      })
    );
  }

  getSopByNocId(id_noc: number): Promise<Isoportes[]> {
    return firstValueFrom(
      this.httpClient.get<Isoportes[]>(
        `${this.baseUrl}/mis-soportes/${id_noc}`,
        {
          withCredentials: true,
        }
      )
    );
  }

  createSop(body: Isoportes): Promise<Isoportes> {
    return firstValueFrom(
      this.httpClient.post<Isoportes>(this.baseUrl, body, {
        withCredentials: true,
      })
    );
  }

  aceptarSoporte(id_sop: number, body: any): Promise<any> {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/${id_sop}`, body, {
        withCredentials: true,
      })
    );
  }

  actualizarEstadoSop(id_sop: string, body: any): Promise<any> {
    return firstValueFrom(
      this.httpClient.put<any>(
        `${this.baseUrl}/mis-soportes/solucion/${id_sop}`,
        body,
        { withCredentials: true }
      )
    );
  }
}
