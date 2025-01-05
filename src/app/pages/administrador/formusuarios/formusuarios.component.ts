import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { Iusuarios } from '../../../interfaces/iusuarios.interface';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { FuncionesService } from '../../../services/funciones.service';
import { Ifunciones } from '../../../interfaces/ifunciones.interface';

@Component({
  selector: 'app-formusuarios',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './formusuarios.component.html',
  styleUrl: './formusuarios.component.css',
})
export class FormusuariosComponent {
  //variables
  tipo: string = 'Crear';
  usuarioForm: FormGroup;
  funcionesForm: FormGroup;
  errorForm: any[] = [];
  arrfunciones: Ifunciones[] = [];
  selectedValues: { rol: string; funcion: string }[] = [];

  //injectables
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  usuarioServices = inject(UsuariosService);
  funcionesServices = inject(FuncionesService);

  constructor(private fb: FormBuilder) {
    this.funcionesForm = new FormGroup(
      {
        rol: new FormControl(null, []),
        funcion: new FormControl(null, []),
      },
      []
    );

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

  async ngOnInit() {
    this.funcionesForm = this.fb.group({});

    this.activatedRoute.params.subscribe(async (params: any) => {
      if (params.id) {
        //Actualizando

        this.tipo = 'Actualizar';
        //pedimos por id los datos de empleado

        const usuario: Iusuarios = await this.usuarioServices.getbyId(
          params.id
        );

        // Convertimos fecha_nac y fecha_cont a objetos de tipo Date
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

        this.funcionesForm = new FormGroup(
          {
            rol: new FormControl(usuario.id, []),
            funciones: new FormControl(usuario.id, []),
          },
          []
        );
      }
    });
    try {
      const response = await this.funcionesServices.getAll();
      this.arrfunciones = response;
      console.log(this.arrfunciones);
    } catch (error) {
      console.log(error);
    }
  }

  addStatus(item: { rol: string; funcion: string }, event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      // Agregar el elemento si está marcado
      this.selectedValues.push(item);
    } else {
      // Eliminar el elemento si está desmarcado
      this.selectedValues = this.selectedValues.filter(
        (selected) =>
          selected.rol !== item.rol || selected.funcion !== item.funcion
      );
    }

    this.usuarioForm.value.rol = this.selectedValues;
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
          Swal.fire('Realizado', 'Usuario Actualizado', 'success');
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
