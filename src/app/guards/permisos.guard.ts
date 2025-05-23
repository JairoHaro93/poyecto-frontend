import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AutenticacionService } from '../services/sistema/autenticacion.service';

export function permisosGuard(permiso: string): CanActivateFn {
  return async () => {
    const router = inject(Router);
    const authService = inject(AutenticacionService);

    try {
      const usuario = await authService.getUsuarioAutenticado();

      if (!usuario.rol.includes(permiso)) {
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
      router.navigateByUrl('/login');
      return false;
    }
  };
}
