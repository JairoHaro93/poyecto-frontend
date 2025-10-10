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

const isApi = (url: string) => url.startsWith(environment.API_URL);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AutenticacionService);

  const reqWithCreds = isApi(req.url)
    ? req.clone({ withCredentials: true })
    : req;

  return next(reqWithCreds).pipe(
    // 👇 si el backend envía X-Session-Expires, agenda el auto-logout
    tap((event) => {
      if (event instanceof HttpResponse && isApi(req.url)) {
        const exp = event.headers.get('X-Session-Expires');
        if (exp) auth.scheduleAutoLogout(exp);
      }
    }),
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        isApi(req.url)
      ) {
        // cookie vencida → ir a login
        auth.clearSession?.();
        router.navigateByUrl('/login');
      }
      return throwError(() => err);
    })
  );
};
