import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../src/environments/environment.development';
import { lastValueFrom } from 'rxjs';
import { Iusuarios } from '../interfaces/iusuarios.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  //variables
  private baseUrl: string = `${environment.API_URL}/usuarios`;

  //injectables
  private httpClient = inject(HttpClient);

  //metodos
  getAll() {
    return lastValueFrom(this.httpClient.get<Iusuarios[]>(this.baseUrl));
  }
  update() {}

  insert(body: Iusuarios) {}
}
