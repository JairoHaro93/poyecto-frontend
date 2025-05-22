import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutenticacionService } from '../../../services/sistema/autenticacion.service';
import { SoketService } from '../../../services/socket_io/soket.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  formLogin: FormGroup = new FormGroup({
    usuario: new FormControl(),
    password: new FormControl(),
  });

  autenservice = inject(AutenticacionService);
  soketService = inject(SoketService);
  router = inject(Router);

  async onSubmit() {
    try {
      // Login (el token será almacenado en cookie automáticamente)
      await this.autenservice.login(this.formLogin.value);

      // WebSocket puede conectarse aquí si es necesario
      // this.soketService.connectSocket();

      // Redirigir (elige una de las dos opciones)

      // Opción 1: redirigir en la misma pestaña
      this.router.navigateByUrl('/home');

      // Opción 2: abrir en nueva pestaña
      //  const features =
      //    'resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no,noopener=true,toolbar=yes';
      //   window.open('/es/home', '_blank', features);
    } catch ({ error }: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }
}
