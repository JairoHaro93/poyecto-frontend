import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
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


    //metodos
    getAgendaByDate(fecha_age:string) {
    this.httpClient.get<Iagenda[]>(`${this.baseUrl}/mis-soportes/${fecha_age}`)
    }


}
