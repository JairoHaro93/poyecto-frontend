import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import Swal from 'sweetalert2';
interface CustomPayload extends JwtPayload {
  usuario_id: number;
  usuario_usuario: string;
  usuario_rol: string[];
}
export const despacharEquiposGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token_proyecto');
  const data = jwtDecode<CustomPayload>(token!);

  //tiene funcion USUARIOS?
  if (!data.usuario_rol.includes('BDespachar Equipos')) {
    Swal.fire('Error usuario no autorizado', 'error');
    router.navigateByUrl('/home');
    return false;
  }

  return true;
};
