// src/app/core/services/images.service.ts
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ImageItem,
  ImageListResponse,
  UploadResponse,
} from '../../interfaces/negocio/images/images';
import { environment } from '../../../environments/environment';

export interface VisitaConImagenes {
  id: number;
  vis_tipo: string;
  vis_estado: string;
  vis_diagnostico: string;
  vis_coment_cliente: string | null;
  vis_solucion: string | null;
  fecha_actualizacion: string | null;
  imagenes: Record<string, { url: string; ruta: string }>;
}

@Injectable({ providedIn: 'root' })
export class ImagesService {
  private readonly API = `${environment.API_URL}/images`;

  constructor(private http: HttpClient) {}

  list(
    module: string,
    entityId: number | string,
    tag?: string
  ): Observable<ImageItem[]> {
    let params = new HttpParams();
    if (tag) params = params.set('tag', tag);

    return this.http
      .get<ImageListResponse>(`${this.API}/list/${module}/${entityId}`, {
        params,
      })
      .pipe(
        map((r) =>
          (r?.imagenes ?? []).map((it) => ({
            ...it,
            url: it.url ?? `${environment.API_URL}/static/${it.ruta_relativa}`, // ajusta prefix si aplica
          }))
        ),
        catchError((err: HttpErrorResponse) =>
          err.status === 404 ? of([]) : of([])
        )
      );
  }

  /**
   * Sube una imagen con el backend nuevo.
   * - module: 'infraestructura' | 'instalaciones' | 'visitas'
   * - entityId: id lógico (infra_id, ord_ins, id visita, etc.)
   * - tag/position: etiquetado y orden dentro del tag
   */
  upload(
    module: string,
    entityId: number | string,
    file: File,
    opts?: { tag?: string; position?: number }
  ): Observable<UploadResponse> {
    const fd = new FormData();
    fd.append('module', module);
    fd.append('entity_id', String(entityId));
    if (opts?.tag) fd.append('tag', opts.tag);
    if (typeof opts?.position === 'number')
      fd.append('position', String(opts.position));
    fd.append('image', file);

    // Importante: no fijes manualmente Content-Type; HttpClient lo hace
    return this.http.post<UploadResponse>(`${this.API}/upload`, fd).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Upload error', err);
        return throwError(() => err);
      })
    );
  }
  /*
  listVisitasByOrdIns(
    ordIns: number | string
  ): Observable<VisitaConImagenes[]> {
    console.log(`${this.API}/visitas/by-ord/${ordIns}`);
    return this.http.get<VisitaConImagenes[]>(
      `${this.API}/visitas/by-ord/${ordIns}`
    );
  }
*/
  // images.service.ts
  listVisitasByOrdIns(ordIns: string | number) {
    return this.http.get<any[]>(
      `${environment.API_URL}/images/visitas/by-ord/${ordIns}`
    );
  }
}
