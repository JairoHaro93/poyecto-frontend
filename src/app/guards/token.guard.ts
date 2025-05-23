import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AutenticacionService } from '../services/sistema/autenticacion.service';

export const isAuthenticatedGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AutenticacionService);

  try {
    await authService.getUsuarioAutenticado(); // ✅ Si falla, lanza error
    return true;
  } catch (error) {
    Swal.fire('Acceso denegado', 'Debes iniciar sesión', 'warning');
    router.navigateByUrl('/login');
    return false;
  }
};
