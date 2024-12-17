import { Component, inject } from '@angular/core';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
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
