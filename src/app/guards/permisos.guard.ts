// src/app/guards/permisos.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AutenticacionService } from '../services/sistema/autenticacion.service';

/**
 * Guard genérico de permisos basado en nombres de rol/función.
 * Uso:
 *   {
 *     path: 'turnos',
 *     canActivate: [isAuthenticatedGuard, permisosGuard('TURNO_GESTION')],
 *     loadComponent: ...
 *   }
 *
 * O para varios roles válidos:
 *   canActivate: [isAuthenticatedGuard, permisosGuard('JEFE_DEPARTAMENTO', 'RRHH')]
 */
export function permisosGuard(...permisos: string[]): CanActivateFn {
  return async () => {
    const router = inject(Router);
    const authService = inject(AutenticacionService);

    try {
      // 1) Intentar usar lo que ya tenemos en memoria / hydrateSessionOnce
      const usuario =
        authService.usuarioEnMemoria ??
        (await authService.hydrateSessionOnce());

      if (!usuario) {
        Swal.fire(
          'Acceso denegado',
          'Debes iniciar sesión nuevamente',
          'warning'
        );
        router.navigateByUrl('/login');
        return false;
      }

      const roles = usuario.rol ?? [];
      const tienePermiso =
        permisos.length === 0 || permisos.some((p) => roles.includes(p));

      if (!tienePermiso) {
        Swal.fire(
          'Acceso denegado',
          'No tienes permiso para acceder a esta sección',
          'error'
        );
        router.navigateByUrl('/home');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en permisosGuard:', error);
      router.navigateByUrl('/login');
      return false;
    }
  };
}
