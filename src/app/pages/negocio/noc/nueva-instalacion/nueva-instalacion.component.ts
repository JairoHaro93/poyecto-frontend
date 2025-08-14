import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InstalacionesService } from '../../../../services/negocio_latacunga/instalaciones.service';
import Swal from 'sweetalert2';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';

@Component({
  selector: 'app-nueva-instalacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nueva-instalacion.component.html',
  styleUrl: './nueva-instalacion.component.css',
})
export class NuevaInstalacionComponent {
  instalacionForm!: FormGroup;
  agendaService = inject(AgendaService);
  constructor(
    private fb: FormBuilder,
    private instalacionesService: InstalacionesService
  ) {
    this.instalacionForm = this.fb.group({
      ord_ins: [null, Validators.required],
      //    nombres: new FormControl(null, [Validators.required]), // corregido
      //   apellidos: new FormControl(null, [Validators.required]), // corregido
      //    cedula: new FormControl(null, [        Validators.required,        Validators.pattern(/^\d{10}$/),      ]),
      //   tipo: new FormControl('NUEVA', Validators.required),
      //   plan: new FormControl(null, Validators.required),
      telefonos: new FormControl(null, Validators.required),
      coordenadas: new FormControl(null, Validators.required),
      observacion: new FormControl(null),
    });
  }

  convertToUppercase(field: string): void {
    const control = this.instalacionForm.get(field);
    if (control) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }
  async submitForm(): Promise<void> {
    if (this.instalacionForm.invalid) {
      this.instalacionForm.markAllAsTouched();
      return;
    }

    try {
      const data = this.instalacionForm.value;

      // 1. Crear LA INSTALACION en la tabla neg_t_instalaciones

      const response = await this.instalacionesService.createInst(data);

      const bodyAge = {
        ord_ins: data.ord_ins,
        age_tipo: 'INSTALACION', // ✅ usa INSTALACION, no SOPORTE
        age_id_tipo: response.id,
        age_diagnostico: data.observacion,
        age_coordenadas: data.coordenadas,
        age_telefono: data.telefonos,
      };

      // 2. Crear el caso en la tabla neg_t_agenda
      await this.agendaService.postSopAgenda(bodyAge);

      console.log('✅ Instalación creada:', response);
      Swal.fire('Éxito', 'Instalación registrada correctamente', 'success');
      this.instalacionForm.reset();
    } catch (error: any) {
      console.error('❌ Error al crear instalación:', error);
      Swal.fire(
        'Error',
        error?.message || 'No se pudo registrar la instalación',
        'error'
      );
    }
  }

  checkError(controlName: string, error: string): boolean {
    const control = this.instalacionForm.get(controlName);
    return !!(control?.touched && control.hasError(error));
  }
}
