import { Component, inject } from '@angular/core';
import { Iusuarios } from '../../../interfaces/iusuarios.interface';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';

@Component({
  selector: 'app-vistausuarios',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './vistausuarios.component.html',
  styleUrl: './vistausuarios.component.css',
})
export class VistausuariosComponent {
  employee: Iusuarios | null = null;
  activatedRoute = inject(ActivatedRoute);
  employeeService = inject(UsuariosService);

  ngOnInit() {
    this.activatedRoute.params.subscribe(async (params: any) => {
      let id = params.id;
      this.employee = await this.employeeService.getbyId(id);
      console.table(this.employee);
    });
  }
}
