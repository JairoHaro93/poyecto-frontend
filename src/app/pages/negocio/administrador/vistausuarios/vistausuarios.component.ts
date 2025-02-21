import { Component, inject } from '@angular/core';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { DatePipe } from '@angular/common';
import { FuncionesService } from '../../../../services/sistema/funciones.service';

@Component({
  selector: 'app-vistausuarios',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './vistausuarios.component.html',
  styleUrl: './vistausuarios.component.css',
})
export class VistausuariosComponent {
  employee: Iusuarios | null = null;
  arrfunciones: any[] = [];
  activatedRoute = inject(ActivatedRoute);
  employeeService = inject(UsuariosService);
  private funcionesServices = inject(FuncionesService);

  async ngOnInit() {
    this.activatedRoute.params.subscribe(async (params: any) => {
      let id = params.id;
      this.employee = await this.employeeService.getbyId(id);

      this.arrfunciones = await this.funcionesServices.getbyId(id);
      //   console.table(this.arrfunciones);
    });
  }
}
