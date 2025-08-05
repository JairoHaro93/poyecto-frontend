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

  // ✅ Método para crear un Vis (retorna una Promesa con la respuesta del backend)
  createVis(body: IVis): Promise<IVis> {
    return firstValueFrom(
      this.httpClient.post<IVis>(this.baseUrl, body, {
        withCredentials: true,
      })
    );
  }

  getVisById(id_vis: number): Promise<IVis> {
    return firstValueFrom(
      this.httpClient.get<IVis>(`${this.baseUrl}/${id_vis}`, {
        withCredentials: true,
      })
    );
  }

  //OBTIENE UNA LISTA CON TODOS LAS VISITAS DE UNA ORDINS
  //router.get("/visitas/:ord_ins", checkToken, getAllVisByOrdIns);
  getAllVisByOrdIns(ord_ins: number): Promise<IVis[]> {
    return firstValueFrom(
      this.httpClient.get<IVis[]>(`${this.baseUrl}/visitas/${ord_ins}`, {
        withCredentials: true,
      })
    );
  }

  //ACTUALIZA UN LOS
  //router.put("/:id_vis", checkToken, updateVisById);
  updateVisById(
    id_vis: number,
    estado: string,
    solucion: string
  ): Promise<IVis> {
    return firstValueFrom(
      this.httpClient.put<IVis>(
        `${this.baseUrl}/${id_vis}`,
        { vis_estado: estado, vis_solucion: solucion },
        { withCredentials: true } // ✅ Esto va como tercer parámetro
      )
    );
  }
}
