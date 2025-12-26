// src/app/services/negocio_latacunga/justificaciones.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JustificacionesService {
  private http = inject(HttpClient);

  // ✅ coincide con: router.use("/justificacion", ...)
  private baseUrl = `${environment.API_URL}/justificacion`;

  resolverJustificacion(
    turnoId: number,
    key: 'atraso' | 'salida',
    estado: 'APROBADA' | 'RECHAZADA',
    minutos: number | null
  ): Promise<any> {
    const body: any = { estado };
    if (minutos !== null && minutos !== undefined) body.minutos = minutos;

    // ✅ /api/justificacion/turnos/:id/justificaciones/:key/resolver
    return firstValueFrom(
      this.http.put(
        `${this.baseUrl}/${turnoId}/justificaciones/${key}/resolver`,
        body,
        { withCredentials: true }
      )
    );
  }
}
