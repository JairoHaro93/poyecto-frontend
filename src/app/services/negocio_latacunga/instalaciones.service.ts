import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NuevaInstalacion } from '../../interfaces/negocio/instalaciones/nueva-instalacion';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InstalacionesService {
  private baseUrl: string = `${environment.API_URL}/instalaciones`;
  private httpClient = inject(HttpClient);

  //CREA UNA INSTALACION
  //router.post("/", checkToken, createInstalacion);
  createInst(body: NuevaInstalacion): Promise<NuevaInstalacion> {
    return firstValueFrom(
      this.httpClient.post<NuevaInstalacion>(this.baseUrl, body, {
        withCredentials: true,
      })
    );
  }

  getInstById(id_sop: number): Promise<NuevaInstalacion> {
    return firstValueFrom(
      this.httpClient.get<NuevaInstalacion>(`${this.baseUrl}/${id_sop}`, {
        withCredentials: true,
      })
    );
  }
}
