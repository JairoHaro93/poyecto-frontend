import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { VisService } from '../../../../services/negocio_latacunga/vis.service';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Router } from '@angular/router';
import { SoketService } from '../../../../services/socket_io/soket.service'; // ✅

@Component({
  selector: 'app-migracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './migracion.component.html',
  styleUrl: './migracion.component.css',
})
export class MigracionComponent {
  migracionForm!: FormGroup;

  agendaService = inject(AgendaService);
  clientesServie = inject(ClientesService);
  soketService = inject(SoketService); // ✅
  router = inject(Router);

  isReady = false;

  constructor(
    private fb: FormBuilder,
    private visitaService: VisService,
  ) {
    this.migracionForm = this.fb.group({
      ord_ins: new FormControl<string | null>(null, [
        Validators.required,
        Validators.pattern(/^\d+$/),
      ]),
      telefonos: new FormControl<string | null>(null, [Validators.required]),
      observacion: new FormControl<string | null>(null, [Validators.required]),
    });

    this.isReady = true;
  }

  convertToUppercase(field: string): void {
    const control = this.migracionForm.get(field);
    if (control) {
      const value = String(control.value ?? '');
      control.setValue(value.toUpperCase(), { emitEvent: false });
    }
  }

  async submitForm(): Promise<void> {
    if (this.migracionForm.invalid) {
      this.migracionForm.markAllAsTouched();
      return;
    }

    try {
      const data = this.migracionForm.value;

      const response2 = await this.clientesServie.getInfoServicioByOrdId(
        data.ord_ins,
      );

      const coord = response2?.servicios?.[0]?.coordenadas;
      if (!coord) {
        await Swal.fire(
          'Atención',
          'No se encontraron coordenadas para ese ORD_INS.',
          'warning',
        );
        return;
      }

      const bodyAge = {
        ord_ins: Number(data.ord_ins),
        age_tipo: 'MIGRACION',
        age_diagnostico: data.observacion,
        age_coordenadas: coord,
        age_telefono: data.telefonos,
      };

      await this.agendaService.postSopAgenda(bodyAge);

      // ✅ asegura conexión y notifica a NOC
      await this.soketService.connectSocket();
      this.soketService.emit('trabajoPreagendado');

      await Swal.fire('Éxito', 'Migración registrada correctamente', 'success');

      this.migracionForm.reset();
      await this.router.navigateByUrl(`/home/noc/agenda`);
    } catch (error: any) {
      console.error('❌ Error al crear la migración:', error);
      Swal.fire(
        'Error',
        error?.message || 'No se pudo registrar la migración',
        'error',
      );
    }
  }

  checkError(controlName: string, error: string): boolean {
    const control = this.migracionForm.get(controlName);
    return !!(control?.touched && control.hasError(error));
  }
}
