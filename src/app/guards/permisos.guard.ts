import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AutenticacionService } from '../services/sistema/autenticacion.service';

type FuncItem = { nombre: string; is_finger_auth: number };

export function permisosGuard(...permisos: string[]): CanActivateFn {
  return async () => {
    const router = inject(Router);
    const authService = inject(AutenticacionService);

    try {
      const usuario =
        authService.usuarioEnMemoria ??
        (await authService.hydrateSessionOnce());

      if (!usuario) {
        await Swal.fire(
          'Acceso denegado',
          'Debes iniciar sesión nuevamente',
          'warning',
        );
        router.navigateByUrl('/login');
        return false;
      }

      // si no pides permisos específicos, deja pasar
      if (permisos.length === 0) return true;

      const roles = usuario.rol ?? [];
      const tienePorRol = permisos.some((p) => roles.includes(p));
      if (tienePorRol) return true;

      // ✅ acá diferenciamos: “no tiene permiso” vs “tiene permiso pero requiere huella”
      const funciones = (usuario as any).funciones as FuncItem[] | undefined;
      const fingerOk = Number((usuario as any).is_auth_finger) === 1;

      const match = permisos
        .map((p) => funciones?.find((f) => f?.nombre === p))
        .find(Boolean);

      // si existe la función, pero está marcada con huella y el usuario no tiene huella activa
      if (
        match &&
        Number((match as FuncItem).is_finger_auth) === 1 &&
        !fingerOk
      ) {
        await Swal.fire(
          'Acceso denegado',
          'Acceso denegado: requiere autenticación por huella',
          'warning',
        );
        router.navigateByUrl('/home');
        return false;
      }

      // caso normal: no tiene permiso
      await Swal.fire(
        'Acceso denegado',
        'No tienes permiso para acceder a esta sección',
        'error',
      );
      router.navigateByUrl('/home');
      return false;
    } catch (error) {
      console.error('Error en permisosGuard:', error);
      router.navigateByUrl('/login');
      return false;
    }
  };
}
