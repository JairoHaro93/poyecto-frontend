import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';

export const tokenGuard: CanActivateFn = (route, state) => {

  const router = inject(Router)

  const token = localStorage.getItem('token_proyecto')

  if(token){
  return true;
}
Swal.fire('Error','Debes estar autenticado',"warning")
router.navigateByUrl('/login')

return false
};
