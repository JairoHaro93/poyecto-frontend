import { inject, Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Iagenda } from '../../interfaces/negocio/agenda/iagenda.interface';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {


    //variables
    private baseUrl: string = `${environment.API_URL}/agenda`;
  
    //injectables
    private httpClient = inject(HttpClient);


    //METODO OBTENER LA AGENDA POR FECHA
    getAgendaByDate(fecha_age:string) {
   return firstValueFrom( this.httpClient.get<Iagenda[]>(`${this.baseUrl}/${fecha_age}`))
    }


    //METODO CREAR TRABAJO EN AGENDA
    insertTrabajoEnAgenda(body: Iagenda): Promise<Iagenda> {
    return firstValueFrom(this.httpClient.post<Iagenda>(`${this.baseUrl}/crear`,body));
  }

}
