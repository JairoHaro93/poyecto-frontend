import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Iagenda } from '../../interfaces/negocio/agenda/iagenda.interface';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private baseUrl: string = `${environment.API_URL}/agenda`;
  private httpClient = inject(HttpClient);

  getAgendaByDate(fecha_age: string) {
    return firstValueFrom(
      this.httpClient.get<Iagenda[]>(`${this.baseUrl}/${fecha_age}`, {
        withCredentials: true,
      })
    );
  }

  getAgendaPendienteByFecha(fecha_age: string) {
    return firstValueFrom(
      this.httpClient.get<{ soportes_pendientes: number }>(
        `${this.baseUrl}/pendientes/${fecha_age}`,
        {
          withCredentials: true,
        }
      )
    );
  }

  getPreAgenda() {
    return firstValueFrom(
      this.httpClient.get<Iagenda[]>(`${this.baseUrl}/preagenda`, {
        withCredentials: true,
      })
    );
  }

  getAgendaTec(id_tec: number) {
    return firstValueFrom(
      this.httpClient.get<Iagenda[]>(
        `${this.baseUrl}/mis-trabajos-tec/${id_tec}`,
        {
          withCredentials: true,
        }
      )
    );
  }

  getInfoSolByAgeId(age_id: number) {
    return firstValueFrom(
      this.httpClient.get<Iagenda[]>(`${this.baseUrl}/sol/${age_id}`, {
        withCredentials: true,
      })
    );
  }

  postSopAgenda(body: any) {
    return firstValueFrom(
      this.httpClient.post<Iagenda[]>(`${this.baseUrl}/agenda-sop`, body, {
        withCredentials: true,
      })
    );
  }

  actualizarAgendaHorario(id: number, body: Iagenda): Promise<any> {
    return firstValueFrom(
      this.httpClient.put(`${this.baseUrl}/edita-hora/${id}`, body, {
        withCredentials: true,
      })
    );
  }

  actualizarAgendaSolucuion(id: number, body: Iagenda): Promise<any> {
    return firstValueFrom(
      this.httpClient.put(`${this.baseUrl}/edita-sol/${id}`, body, {
        withCredentials: true,
      })
    );
  }

  getImagenesPorTrabajo(tabla: string, trabajo_id: number | string) {
    const url = `${this.baseUrl}/images/${tabla}/${trabajo_id}`;
    return this.httpClient.get<any>(url);
  }
}
