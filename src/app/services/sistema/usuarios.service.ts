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

  //metodos
  getAll() {
    return lastValueFrom(this.httpClient.get<Iusuarios[]>(this.baseUrl));
  }

  /**
   * GETBYID()
   * return Promise <IEmployee>
   */
  getbyId(id: string): Promise<Iusuarios> {
    return firstValueFrom(
      this.httpClient.get<Iusuarios>(`${this.baseUrl}/${id}`)
    );
  }

  /**
   * UPDATE(body: Iemployee)
   * return Promise <IEmployee>
   */
  update(body: Iusuarios): Promise<Iusuarios> {
    //esta Anpi no encesito enviar el Id edl usuario solo pasarlo por parametri, si lo envio me da un error asi q lo elimino
    let id = body.id;
    //esto sirve para eliminar de un objeto una clave con su valor
    delete body.id;
    return firstValueFrom(
      this.httpClient.put<Iusuarios>(`${this.baseUrl}/${id}`, body)
    );
  }

  /**
   * INSERT(body: Iemployee)
   * return Promise <IEmployee>
   */
  insert(body: Iusuarios): Promise<Iusuarios> {
    return firstValueFrom(this.httpClient.post<Iusuarios>(this.baseUrl, body));
  }

  /**
   * DELETE(id: string)
   * return Promise <IEmployee>
   */
  delete(id: number): Promise<Iusuarios> {
    return firstValueFrom(
      this.httpClient.delete<Iusuarios>(`${this.baseUrl}/${id}`)
    );
  }
}
