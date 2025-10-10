// src/app/.../token.guards.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AutenticacionService } from '../services/sistema/autenticacion.service';

export const isAuthenticatedGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AutenticacionService);

  try {
    // ✅ 1) Si ya hay usuario en memoria, no pegues a /me otra vez
    if (authService.usuarioEnMemoria) return true;

    // ✅ 2) Rehidrata una sola vez (llama a /me si hace falta)
    const me = await authService.hydrateSessionOnce();
    if (me) return true;

    // ❌ 3) No hay sesión válida -> login
    Swal.fire('Acceso denegado', 'Debes iniciar sesión', 'warning');
    router.navigateByUrl('/login');
    return false;
  } catch {
    Swal.fire('Acceso denegado', 'Debes iniciar sesión', 'warning');
    router.navigateByUrl('/login');
    return false;
  }
};
