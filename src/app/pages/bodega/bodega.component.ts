import { Component, inject } from '@angular/core';
import { format } from 'date-fns';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { FuncionesService } from '../../services/funciones.service';
import { Iusuarios } from '../../interfaces/iusuarios.interface';

@Component({
  selector: 'app-bodega',
  standalone: true,
  imports: [],
  templateUrl: './bodega.component.html',
  styleUrl: './bodega.component.css',
})
export class BodegaComponent {
  arrfunciones: any[] = [];
  selectedIds: number[] = [];
  usuarioForm!: FormGroup;
  tipo: string = 'Crear';

  private activatedRoute = inject(ActivatedRoute);
  private usuarioServices = inject(UsuariosService);
  private funcionesServices = inject(FuncionesService);

  async ngOnInit() {
    this.loadFunciones();

    this.activatedRoute.params.subscribe(async (params: any) => {
      if (params.id) {
        this.tipo = 'Actualizar';
        await this.loadUsuario(params.id);
      }
    });
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

  private async loadFunciones() {
    try {
      this.arrfunciones = await this.funcionesServices.getAll();
    } catch (error) {
      console.error('Error loading funciones:', error);
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
}
