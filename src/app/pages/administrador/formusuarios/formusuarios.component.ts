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

@Component({
  selector: 'app-formusuarios',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './formusuarios.component.html',
  styleUrl: './formusuarios.component.css',
})
export class FormusuariosComponent {
  tipo: string = 'Crear';
  usuarioForm!: FormGroup;
  funcionesForm!: FormGroup;
  errorForm: any[] = [];
  arrfunciones: any[] = [];
  selectedIds: number[] = [];

  // Injectables
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private usuarioServices = inject(UsuariosService);
  private funcionesServices = inject(FuncionesService);

  constructor(private fb: FormBuilder) {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.usuarioForm = this.fb.group({
      id: [null],
      nombre: [null],
      apellido: [null],
      usuario: [null],
      ci: [null],
      password: [null],
      fecha_nac: [null],
      fecha_cont: [null],
      genero: [null],
      rol: [null],
    });

    this.funcionesForm = this.fb.group({
      rol: [null],
      funcion: [null],
    });
  }

  async ngOnInit() {
    this.loadFunciones();

    this.activatedRoute.params.subscribe(async (params: any) => {
      if (params.id) {
        this.tipo = 'Actualizar';
        await this.loadUsuario(params.id);
      }
    });
  }

  private async loadFunciones() {
    try {
      this.arrfunciones = await this.funcionesServices.getAll();
    } catch (error) {
      console.error('Error loading funciones:', error);
    }
  }

  private async loadUsuario(id: string) {
    try {
      const usuario: Iusuarios = await this.usuarioServices.getbyId(id);
      this.usuarioForm.patchValue({
        ...usuario,
        fecha_nac: usuario.fecha_nac
          ? format(new Date(usuario.fecha_nac), 'yyyy-MM-dd')
          : null,
        fecha_cont: usuario.fecha_cont
          ? format(new Date(usuario.fecha_cont), 'yyyy-MM-dd')
          : null,
      });
    } catch (error) {
      console.error('Error loading usuario:', error);
    }
  }

  addStatus(item: { funcion: number }, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.selectedIds.includes(item.funcion)) {
        this.selectedIds.push(item.funcion);
      }
    } else {
      this.selectedIds = this.selectedIds.filter((id) => id !== item.funcion);
    }
    this.usuarioForm.value.rol = this.selectedIds;
    //  this.usuarioForm.patchValue({ rol: this.selectedIds });
  }

  async getDataForm() {
    try {
      const usuarioData = this.usuarioForm.value;

      if (usuarioData.id) {
        // Actualizar
        const response = await this.usuarioServices.update(usuarioData);
        Swal.fire('Realizado', 'Usuario Actualizado', 'success');
      } else {
        // Insertar
        const response = await this.usuarioServices.insert(usuarioData);
        Swal.fire('Realizado', 'Usuario Creado', 'success');
      }

      this.router.navigate(['/home', 'administrador', 'usuarios']);
    } catch ({ error }: any) {
      this.errorForm = error || [];
      console.error('Error guardando usuario:', this.errorForm);
    }
  }
}
