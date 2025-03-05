import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  //variables
  private baseUrl: string = `${environment.API_URL}/clientes`;

  //injectables
  private httpClient = inject(HttpClient);

  //metodos
  getInfoClientes() {
    return lastValueFrom(this.httpClient.get<[]>(this.baseUrl));
  }

  getInfoClientesMapa() {
    return lastValueFrom(this.httpClient.get<[]>(`${this.baseUrl}/mapas`));
  }

  getInfoServicioByOrdId(ord_ins: number) {
    return lastValueFrom(this.httpClient.get<[]>(`${this.baseUrl}/${ord_ins}`));
  }
}
