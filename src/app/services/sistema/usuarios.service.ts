import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Iusuarios } from '../../interfaces/sistema/iusuarios.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  //variables
  private baseUrl: string = `${environment.API_URL}/usuarios`;

  //injectables
  private httpClient = inject(HttpClient);

  //METODOS

  //OBTENER TODOS LOS USUARIOS
  getAll() {
    return lastValueFrom(this.httpClient.get<Iusuarios[]>(this.baseUrl));
  }

  //OBTENER TODOS LOS USUARIOS CON AGENDA - TECNICOS
  getAllAgendaTecnicos() {
    return lastValueFrom(
      this.httpClient.get<Iusuarios[]>(`${this.baseUrl}/agenda-tecnicos`)
    );
  }

  //OBTENER USUARIO POR ID
  getbyId(id: string): Promise<Iusuarios> {
    return firstValueFrom(
      this.httpClient.get<Iusuarios>(`${this.baseUrl}/${id}`)
    );
  }

  //ACTUALIZAR USUARIO
  update(body: Iusuarios): Promise<Iusuarios> {
    let id = body.id;

    delete body.id;
    console.log(`${this.baseUrl}/${id}`, body);
    return firstValueFrom(
      this.httpClient.put<Iusuarios>(`${this.baseUrl}/${id}`, body)
    );
  }
  //CREAR USUARIOS
  insert(body: Iusuarios): Promise<Iusuarios> {
    return firstValueFrom(this.httpClient.post<Iusuarios>(this.baseUrl, body));
  }

  //BORRAR USUARUIOS
  delete(id: number): Promise<Iusuarios> {
    return firstValueFrom(
      this.httpClient.delete<Iusuarios>(`${this.baseUrl}/${id}`)
    );
  }
}
