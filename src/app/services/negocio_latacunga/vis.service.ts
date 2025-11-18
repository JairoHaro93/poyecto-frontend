import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IVis } from '../../interfaces/negocio/vis/vis.interface';

@Injectable({
  providedIn: 'root',
})
export class VisService {
  private baseUrl: string = `${environment.API_URL}/vis`;
  private httpClient = inject(HttpClient);

  //CREA UNA VISITA
  //router.post("/", checkToken, createVis);
  /*
  createVis(body: any): Promise<IVis> {
    return firstValueFrom(
      this.httpClient.post<IVis>(this.baseUrl, body, {
        withCredentials: true,
      })
    );
  }
*/
  //OBTIENE UNA VISITA POR ID
  //router.get("/:id_vis", checkToken, getVisById);

  /*
  getVisById(id_vis: number): Promise<IVis> {
    return firstValueFrom(
      this.httpClient.get<IVis>(`${this.baseUrl}/${id_vis}`, {
        withCredentials: true,
      })
    );
  }
*/
  //ACTUALIZA UNA VISITA
  //router.put("/:id_vis", checkToken, updateVisById);
  /*
  updateVisById(
    id_vis: number,
    estado: string,
    solucion: string
  ): Promise<IVis> {
    return firstValueFrom(
      this.httpClient.put<IVis>(
        `${this.baseUrl}/${id_vis}`,
        { vis_estado: estado, vis_solucion: solucion },
        { withCredentials: true }
      )
    );
  }*/
}
