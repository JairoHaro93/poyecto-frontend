import { Component, inject } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  //variables

  //injectables
  usuariosServices = inject(UsuariosService);

  async ngOnInit() {
    const usuarios = await this.usuariosServices.getAll();
    console.log(usuarios);
  }
}
