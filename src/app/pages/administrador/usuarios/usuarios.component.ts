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

  async delete(id: number | undefined) {
    if (id) {
      let borrado = confirm('Deseas Borrar el empleado ' + id);
      if (borrado) {
        //llamo al servicio y hago el borrado
        try {
          const response: Iusuarios = await this.usuarioServices.delete(id);
          if (response.id) {
            const response = await this.usuarioServices.getAll();
            this.arrUsuarios = response;
            alert('Empleado borrado correctamente');
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
}
