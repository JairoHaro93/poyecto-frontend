import { Component, Inject, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { Iusuarios } from '../../../interfaces/iusuarios.interface';
import { format } from 'date-fns';

@Component({
  selector: 'app-formusuarios',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './formusuarios.component.html',
  styleUrl: './formusuarios.component.css',
})
export class FormusuariosComponent {
  tipo: string = 'Crear';
  usuarioForm: FormGroup;
  errorForm: any[] = [];
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  usuarioServices = inject(UsuariosService);
  constructor() {
    this.usuarioForm = new FormGroup(
      {
        nombre: new FormControl(null, []),
        apellido: new FormControl(null, []),
        usuario: new FormControl(null, []),
        ci: new FormControl(null, []),
        password: new FormControl(null, []),
        fecha_nac: new FormControl(null, []),
        fecha_cont: new FormControl(null, []),
        genero: new FormControl(null, []),
        rol: new FormControl(null, []),
      },
      []
    );
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(async (params: any) => {
      if (params.id) {
        //Actualizando

        this.tipo = 'Actualizar';
        //pedimos por id los datos de empleado

        const usuario: Iusuarios = await this.usuarioServices.getbyId(
          params.id
        );

        // Convertimos fecha_nac y fecha_cont a objetos de tipo Date

        // const fechaNac = employee.fecha_nac?new Date(employee.fecha_nac): null;

        const fechaNac = usuario.fecha_nac ? new Date(usuario.fecha_nac) : null;

        const fechaNac1 = format(fechaNac!, 'yyyy-MM-dd');

        const fechaCont = usuario.fecha_cont
          ? new Date(usuario.fecha_cont)
          : null;
        const fechaCont1 = format(fechaCont!, 'yyyy-MM-dd');
        this.usuarioForm = new FormGroup(
          {
            id: new FormControl(usuario.id, []),
            nombre: new FormControl(usuario.nombre, []),
            apellido: new FormControl(usuario.apellido, []),
            ci: new FormControl(usuario.ci, []),
            usuario: new FormControl(usuario.usuario, []),
            password: new FormControl(usuario.password, []),
            fecha_nac: new FormControl(fechaNac1, []),
            fecha_cont: new FormControl(fechaCont1, []),
            genero: new FormControl(usuario.genero, []),
            rol: new FormControl(usuario.rol, []),
          },
          []
        );
      }
    });
  }

  async getDataForm() {
    //  si getDataForm trae id entonces actualizo y sin inserto
    if (this.usuarioForm.value.id) {
      //actualizando
      try {
        const response: Iusuarios = await this.usuarioServices.update(
          this.usuarioForm.value
        );

        if (response.id) {
          alert('Usuario Actualizado');
          this.router.navigate(['/home', 'administrador', 'usuarios']);
        }
      } catch ({ error }: any) {
        this.errorForm = error;
        console.log(this.errorForm);
      }
    } else {
      // insertando

      try {
        const response: Iusuarios = await this.usuarioServices.insert(
          this.usuarioForm.value
        );
        if (response.id) {
          this.router.navigate(['/home', 'administrador', 'usuarios']);
        }
      } catch ({ error }: any) {
        this.errorForm = error;
        console.log(this.errorForm);
      }
    }
  }
}
