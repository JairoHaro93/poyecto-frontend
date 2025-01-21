import { CanActivateFn } from '@angular/router';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface CustomPayload extends JwtPayload {
  usuario_id: number;
  usuario_usuario: string;
  usuario_rol: number[];
}

export const roleGuard: CanActivateFn = (route, state) => {
  let funciones: number[] = [];
  const token = localStorage.getItem('token_proyecto');
  const data = jwtDecode<CustomPayload>(token!);
  //console.log(data);

  funciones = data.usuario_rol;

  //tiene funcion USUARIO
  if (funciones.some((rol) => rol === 1)) {
    return true;
  }

  return false;
};
