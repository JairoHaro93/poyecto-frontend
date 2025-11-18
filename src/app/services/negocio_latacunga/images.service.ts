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
        map((r) => {
          const items = r?.imagenes ?? [];
          return items.map((it) => {
            // ✅ Confiar en la URL que entrega el backend
            const url = (it as any).url as string | undefined;
            return { ...it, url: url ?? '' } as ImageItem;
          });
        }),
        catchError((err: HttpErrorResponse) =>
          err.status === 404 ? of([]) : of([])
        )
      );
  }

  /**
   * Sube una imagen con el backend nuevo.
   * - module: 'infraestructura' | 'instalaciones' | 'visitas'
   * - entityId: id lógico (infra_id, ord_ins, age_id para visitas, etc.)
   * - tag/position: etiquetado y orden dentro del tag
   * - ordIns: (opcional) si es VISITA y quieres anidar en la carpeta de la instalación
   */
  upload(
    module: string,
    entityId: number | string,
    file: File,
    opts?: { tag?: string; position?: number; ordIns?: number | string } // 👈 NUEVO ordIns
  ): Observable<UploadResponse> {
    const fd = new FormData();
    fd.append('module', module);
    fd.append('entity_id', String(entityId));
    if (opts?.tag) fd.append('tag', opts.tag);
    if (typeof opts?.position === 'number')
      fd.append('position', String(opts.position));
    if (opts?.ordIns != null) fd.append('ord_ins', String(opts.ordIns)); // 👈 ENVÍA ord_ins
    fd.append('image', file);

    return this.http.post<UploadResponse>(`${this.API}/upload`, fd).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Upload error', err);
        return throwError(() => err);
      })
    );
  }

  // ==== Helpers alineados al backend nuevo ====

  /** Imágenes de INSTALACIÓN por ord_ins (directo al módulo 'instalaciones') */
  listInstalacion(ordIns: string | number): Observable<ImageItem[]> {
    return this.list('instalaciones', ordIns);
  }

  /** Imágenes de VISITA por age_id (entity_id = id de agenda) */
  listVisitaByAgeId(ageId: string | number): Observable<ImageItem[]> {
    return this.list('visitas', ageId);
  }

  // ==== Legacy (si aún usas este endpoint, deja este método; si no, elimínalo) ====

  /** LEGACY: visitas por ORD_INS desde endpoint antiguo basado en neg_t_vis */
  listVisitasByOrdIns(ordIns: string | number) {
    return this.http.get<any[]>(`${this.API}/visitas/by-ord/${ordIns}`);
  }
}
