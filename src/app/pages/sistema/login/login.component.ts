import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutenticacionService } from '../../../services/sistema/autenticacion.service';
import { SoketService } from '../../../services/socket_io/soket.service'; // 👈 asegúrate del path
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
  soketService = inject(SoketService); // 👈 inyectar el servicio de sockets
  router = inject(Router);

  async onSubmit() {
    try {
      const response = await this.autenservice.login(this.formLogin.value);

      // Guardar token en localStorage
      localStorage.setItem('token_proyecto', response.token);

      // 🔌 Conectar WebSocket después del login
      this.soketService.connectSocket();

      // Redirigir
      this.router.navigateByUrl('/home');
    } catch ({ error }: any) {
      Swal.fire('Error', error.message, 'error');
    }
  }
}
