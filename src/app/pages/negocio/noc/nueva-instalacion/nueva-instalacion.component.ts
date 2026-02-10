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
import { Router } from '@angular/router';
import { SoketService } from '../../../../services/socket_io/soket.service'; // ✅

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
  soketService = inject(SoketService); // ✅
  router = inject(Router);

  isReady = false;

  constructor(
    private fb: FormBuilder,
    private instalacionesService: InstalacionesService,
  ) {
    this.instalacionForm = this.fb.group({
      ord_ins: [null, Validators.required],
      telefonos: new FormControl(null, Validators.required),
      coordenadas: new FormControl(null, Validators.required),
      observacion: new FormControl(null),
    });

    this.isReady = true;
  }

  convertToUppercase(field: string): void {
    const control = this.instalacionForm.get(field);
    if (control) {
      control.setValue(String(control.value ?? '').toUpperCase(), {
        emitEvent: false,
      });
    }
  }

  async submitForm(): Promise<void> {
    if (this.instalacionForm.invalid) {
      this.instalacionForm.markAllAsTouched();
      return;
    }

    try {
      const data = this.instalacionForm.value;

      // 1) Crear instalación
      const response = await this.instalacionesService.createInst(data);

      // 2) Crear trabajo en agenda (preagenda)
      const bodyAge = {
        ord_ins: data.ord_ins,
        age_tipo: 'INSTALACION',
        age_id_tipo: response.id,
        age_diagnostico: data.observacion,
        age_coordenadas: data.coordenadas,
        age_telefono: data.telefonos,
      };

      await this.agendaService.postSopAgenda(bodyAge);

      // ✅ notificar a NOC (sidebar/agenda en otros equipos)
      await this.soketService.connectSocket();
      this.soketService.emit('trabajoPreagendado');

      await Swal.fire(
        'Éxito',
        'Instalación registrada correctamente',
        'success',
      );

      this.instalacionForm.reset();
      await this.router.navigateByUrl(`/home/noc/agenda`);
    } catch (error: any) {
      console.error('❌ Error al crear instalación:', error);
      Swal.fire(
        'Error',
        error?.message || 'No se pudo registrar la instalación',
        'error',
      );
    }
  }

  checkError(controlName: string, error: string): boolean {
    const control = this.instalacionForm.get(controlName);
    return !!(control?.touched && control.hasError(error));
  }
}
