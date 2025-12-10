// reporte-asistencia.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReporteAsistenciaService {
  private baseUrl: string = `${environment.API_URL}/asistencia`;
  private httpClient = inject(HttpClient);

  descargarReporteExcel(params: {
    fecha_desde: string;
    fecha_hasta: string;
    usuario_id: number;
    departamento_id?: number | null;
  }): Promise<HttpResponse<Blob>> {
    let httpParams = new HttpParams()
      .set('fecha_desde', params.fecha_desde)
      .set('fecha_hasta', params.fecha_hasta)
      .set('usuario_id', String(params.usuario_id));

    if (params.departamento_id != null) {
      httpParams = httpParams.set(
        'departamento_id',
        String(params.departamento_id)
      );
    }

    return firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/reporte-excel`, {
        params: httpParams,
        withCredentials: true,
        observe: 'response', // 👈 queremos headers
        responseType: 'blob', // 👈 queremos Blob
      })
    );
  }
}
