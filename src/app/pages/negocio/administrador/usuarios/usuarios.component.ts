import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import Swal from 'sweetalert2';

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

  isReady = false; // ✅ Suavizado de render (NUEVO)

  async ngOnInit() {
    try {
      const response = await this.usuarioServices.getAll();
      this.arrUsuarios = response;
    } catch (error) {
      console.log(error);
    } finally {
      this.isReady = true;
    }
  }

  async delete(id: number | undefined) {
    if (id) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'El usuario será eliminado permanentemente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response: Iusuarios = await this.usuarioServices.delete(id);
            if (response.id) {
              Swal.fire({
                title: 'Eliminado!',
                text: 'El usuario ha sido eliminado.',
                icon: 'success',
              });
              // Actualizamos la lista de usuarios después de eliminar
              const usuariosActualizados = await this.usuarioServices.getAll();
              this.arrUsuarios = usuariosActualizados;
            } else {
              Swal.fire({
                title: 'Error!',
                text: 'No se pudo eliminar el usuario.',
                icon: 'error',
              });
            }
          } catch (error) {
            console.error(error);
            Swal.fire({
              title: 'Error!',
              text: 'Ocurrió un error al eliminar el usuario.',
              icon: 'error',
            });
          }
        }
      });
    }
  }
}
