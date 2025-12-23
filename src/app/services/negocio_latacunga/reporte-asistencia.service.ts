import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReporteAsistenciaService {
  private baseUrl = `${environment.API_URL}/asistencia/reporte-excel`;

  constructor(private http: HttpClient) {}

  descargarReporteExcelMes(paramsIn: { mes: string; usuario_id: number }) {
    const params = new HttpParams()
      .set('mes', paramsIn.mes)
      .set('usuario_id', String(paramsIn.usuario_id));

    return lastValueFrom(
      this.http.get(this.baseUrl, {
        params,
        observe: 'response',
        responseType: 'blob',
      })
    ) as Promise<HttpResponse<Blob>>;
  }
}
