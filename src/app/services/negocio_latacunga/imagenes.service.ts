import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ImagenesService {
  private baseUrl: string = `${environment.API_URL}/imagenes`;
  private httpClient = inject(HttpClient);

  getImagenesPorTrabajo(tabla: string, trabajo_id: string) {
    const url = `${this.baseUrl}/download/${tabla}/${trabajo_id}`;
    return this.httpClient.get<any>(url);
  }

  postImagenesPorTrabajo(
    tabla: string,
    ord_ins: number | string,
    campo: string,
    imagen: File
  ) {
    const formData = new FormData();
    formData.append('tabla', tabla);
    formData.append('ord_ins', ord_ins.toString()); // ← Este valor es el que busca multer
    formData.append('campo', campo);
    formData.append('imagen', imagen);

    const url = `${this.baseUrl}/upload`;
    return this.httpClient.post<any>(url, formData);
  }
}
