import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AutenticacionService } from '../services/sistema/autenticacion.service';
import Swal from 'sweetalert2';

const isApi = (url: string) => url.startsWith(environment.API_URL);

// anti-spam: evita 5 swals seguidos si fallan varias requests
let last403At = 0;

// anti-loop: recargar solo 1 vez por sesión del navegador
const RELOAD_KEY = 'reloaded_after_403';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AutenticacionService);

  const reqWithCreds = isApi(req.url)
    ? req.clone({ withCredentials: true })
    : req;

  return next(reqWithCreds).pipe(
    // ✅ si el backend envía X-Session-Expires, agenda el auto-logout
    tap((event) => {
      if (event instanceof HttpResponse && isApi(req.url)) {
        const exp = event.headers.get('X-Session-Expires');
        if (exp) auth.scheduleAutoLogout(exp);
      }
    }),
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && isApi(req.url)) {
        // ✅ también lee X-Session-Expires en respuestas con error (403, etc.)
        const exp = err.headers?.get?.('X-Session-Expires');
        if (exp) auth.scheduleAutoLogout(exp);

        // ✅ 401: sesión inválida/vencida → login
        if (err.status === 401) {
          auth.clearSession?.();
          router.navigateByUrl('/login');
        }

        // ✅ 403: no autorizado → Swal y recarga (1 sola vez)
        if (err.status === 403) {
          const now = Date.now();
          if (now - last403At > 1200) {
            last403At = now;

            const msg =
              (err.error?.message as string) ||
              'No tienes permisos para realizar esta acción.';

            if (!router.url.startsWith('/login')) {
              Swal.fire('Acceso denegado', msg, 'warning').then(() => {
                if (!sessionStorage.getItem(RELOAD_KEY)) {
                  sessionStorage.setItem(RELOAD_KEY, '1');
                  window.location.reload();
                }
              });
            }
          }
        }
      }

      return throwError(() => err);
    }),
  );
};
