import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IVisConImagenes } from '../../interfaces/negocio/imagenes/imagenes.interface';

@Injectable({
  providedIn: 'root',
})
export class ImagenesService {
  private baseUrl: string = `${environment.API_URL}/imagenes`;
  private httpClient = inject(HttpClient);

  //OBTENER LAS IMAGANES DE UNA INSTALACION
  //router.get("/download/:tabla/:id", obtenerImagenesPorTrabajo);
  getImagenesByTableAndId(tabla: string, trabajo_id: string) {
    const url = `${this.baseUrl}/download/${tabla}/${trabajo_id}`;
    return this.httpClient.get<any>(url);
  }

  //OBTENER TODAS LAS VISITAS POR ORD_INS
  //router.get("/downloadvisitas/:tabla/:ord_ins", obtenerImagenesVisitasByOrdIns);
  getArrayAllInfoVisitasByTableAndId(
    tabla: string,
    ord_ins: string
  ): Promise<IVisConImagenes[]> {
    return firstValueFrom(
      this.httpClient.get<IVisConImagenes[]>(
        `${this.baseUrl}/downloadvisitas/${tabla}/${ord_ins}`,
        { withCredentials: true }
      )
    );
  }

  //SUBE IMAGENES
  //router.post("/upload", upload.single("imagen"), subirImagenUnitaria);
  postImagenUnitaria(
    tabla: string,
    id: string | number,
    campo: string,
    imagen: File,
    directorio: string
  ) {
    const url = `${this.baseUrl}/upload`;

    const formData = new FormData();
    formData.append('tabla', tabla);
    formData.append('id', id.toString()); // id puede ser age_id_sop o ord_ins
    formData.append('campo', campo);
    formData.append('directorio', directorio);
    formData.append('imagen', imagen);

    return this.httpClient.post(url, formData);
  }
}
