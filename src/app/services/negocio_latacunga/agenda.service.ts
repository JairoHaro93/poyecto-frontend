import { inject, Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Iagenda } from '../../interfaces/negocio/agenda/iagenda.interface';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  //variables
  private baseUrl: string = `${environment.API_URL}/agenda`;

  //injectables
  private httpClient = inject(HttpClient);

  //METODO OBTENER LA AGENDA POR FECHA
  getAgendaByDate(fecha_age: string) {
    return firstValueFrom(
      this.httpClient.get<Iagenda[]>(`${this.baseUrl}/${fecha_age}`)
    );
  }

  //METODO OBTENER LA PREAGENDA
  getPreAgenda() {
    return firstValueFrom(
      this.httpClient.get<Iagenda[]>(`${this.baseUrl}/preagenda`)
    );
  }

  //METODO PARA AGREGAR UN SOPORTE A LA AGENDA

  postSopAgenda(body: any) {
    return firstValueFrom(
      this.httpClient.post<Iagenda[]>(`${this.baseUrl}/agenda-sop`, body)
    );
  }

  // METODO PARA ACTUALIZAR FECHA Y HORA DE UN TRABAJO
  actualizarHorarioTrabajo(id: number, body: Iagenda): Promise<any> {
    return firstValueFrom(
      this.httpClient.put(`${this.baseUrl}/edita/${id}`, body)
    );
  }
}
