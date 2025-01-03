import { Component, Inject, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { Iusuarios } from '../../../interfaces/iusuarios.interface';

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

        const employee: Iusuarios = await this.usuarioServices.getbyId(
          params.id
        );

        this.usuarioForm = new FormGroup(
          {
            id: new FormControl(employee.id, []),
            nombre: new FormControl(employee.nombre, []),
            apellido: new FormControl(employee.apellido, []),
            ci: new FormControl(employee.ci, []),
            usuario: new FormControl(employee.usuario, []),
            password: new FormControl(employee.password, []),
            fecha_nac: new FormControl(employee.fecha_nac, []),
            fecha_cont: new FormControl(employee.fecha_cont, []),
            genero: new FormControl(employee.genero, []),
            rol: new FormControl(employee.rol, []),
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
