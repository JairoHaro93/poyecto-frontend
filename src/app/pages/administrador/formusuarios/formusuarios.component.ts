import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { Iusuarios } from '../../../interfaces/iusuarios.interface';

@Component({
  selector: 'app-formusuarios',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './formusuarios.component.html',
  styleUrl: './formusuarios.component.css',
})
export class FormusuariosComponent {
  tipo: string = 'Insertar';
  usuarioForm: FormGroup;
  errorForm: any[] = [];
  router = inject(Router);
  usuarioServices = inject(UsuariosService);

  constructor() {
    this.usuarioForm = new FormGroup(
      {
        nombre: new FormControl(null, []),
        apellidos: new FormControl(null, []),
        email: new FormControl(null, []),
        departamento: new FormControl(null, []),
        telefono: new FormControl(null, []),
        salario: new FormControl(null, []),
      },
      []
    );
  }
}
