import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {
  arrUsuarios: any = [];

  usuarioServices = inject(UsuariosService);

  async ngOnInit() {
    try {
      const response = await this.usuarioServices.getAll();
      this.arrUsuarios = response;
    } catch (error) {
      console.log(error);
    }
  }
}
