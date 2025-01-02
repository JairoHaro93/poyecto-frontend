import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { Iusuarios } from '../../../interfaces/iusuarios.interface';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {
  arrUsuarios: Iusuarios[] = [];

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
