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

  //METODO OBTENER LOS DATOS AGENDADOS A UN TECNICO
  getAgendaTec(id_tec: number) {
    console.log(`${this.baseUrl}/mis-trabajos-tec/${id_tec}`);
    return firstValueFrom(
      this.httpClient.get<Iagenda[]>(
        `${this.baseUrl}/mis-trabajos-tec/${id_tec}`
      )
    );
  }

  //METODO PARA AGREGAR UN SOPORTE A LA AGENDA
  postSopAgenda(body: any) {
    return firstValueFrom(
      this.httpClient.post<Iagenda[]>(`${this.baseUrl}/agenda-sop`, body)
    );
  }

  // METODO PARA ACTUALIZAR EL HORARIO DE UN TRABAJO
  actualizarAgendaHorario(id: number, body: Iagenda): Promise<any> {
    console.log(`${this.baseUrl}/edita-hora/${id}`, body);
    return firstValueFrom(
      this.httpClient.put(`${this.baseUrl}/edita-hora/${id}`, body)
    );
  }

  // METODO PARA ACTUALIZAR LA SOLUCIONES DE UN TRABAJO
  actualizarAgendaSolucuion(id: number, body: Iagenda): Promise<any> {
    console.log(`${this.baseUrl}/edita-sol/${id}`, body);
    return firstValueFrom(
      this.httpClient.put(`${this.baseUrl}/edita-sol/${id}`, body)
    );
  }
}
