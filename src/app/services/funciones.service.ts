import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FuncionesService {
  //variables
  private baseUrl: string = `${environment.API_URL}/funciones`;

  //injectables
  private httpClient = inject(HttpClient);

  //metodos
  getAll() {
    return lastValueFrom(this.httpClient.get<[]>(this.baseUrl));
  }

  /**
   * GETBYID()
   * return
   */
  getbyId(id: string) {
    return firstValueFrom(this.httpClient.get(`${this.baseUrl}/${id}`));
  }
}
