import { CanActivateFn } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const roleGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token_proyecto');
  const data = jwtDecode(token!);
  console.log(data);
  return true;
};
