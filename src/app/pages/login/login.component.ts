import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutenticacionService } from '../../services/autenticacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  //variables
  formLogin: FormGroup = new FormGroup({
    usuario: new FormControl(),
    password: new FormControl(),
  });
  //injectables
  autenservice = inject(AutenticacionService);
  router = inject(Router);

  async onSubmit() {
    try {
      const response = await this.autenservice.login(this.formLogin.value);
      console.log(response);
      localStorage.setItem('token_proyecto', response.token);
      this.router.navigateByUrl('/home');
    } catch ({ error }: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }
}
