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
import { Router } from '@angular/router';
import { SoketService } from '../../../../services/socket_io/soket.service'; // ✅

@Component({
  selector: 'app-traslado-ext',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './traslado-ext.component.html',
  styleUrls: ['./traslado-ext.component.css'],
})
export class TrasladoExtComponent {
  TrasladoForm!: FormGroup;

  agendaService = inject(AgendaService);
  soketService = inject(SoketService); // ✅
  router = inject(Router);

  isReady = false;

  constructor(
    private fb: FormBuilder,
    private visitaService: VisService,
  ) {
    this.TrasladoForm = this.fb.group({
      ord_ins: new FormControl<string | null>(null, [
        Validators.required,
        Validators.pattern(/^\d+$/),
      ]),
      telefonos: new FormControl<string | null>(null, [Validators.required]),
      coordenadas: new FormControl<string | null>(null, [
        Validators.required,
        Validators.pattern(/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/),
      ]),
      observacion: new FormControl<string | null>(null, [Validators.required]),
    });

    this.isReady = true;
  }

  convertToUppercase(field: string): void {
    const control = this.TrasladoForm.get(field);
    if (control) {
      const value = String(control.value ?? '');
      control.setValue(value.toUpperCase(), { emitEvent: false });
    }
  }

  async submitForm(): Promise<void> {
    if (this.TrasladoForm.invalid) {
      this.TrasladoForm.markAllAsTouched();
      return;
    }

    try {
      const data = this.TrasladoForm.value;

      const bodyAge = {
        ord_ins: Number(data.ord_ins),
        age_tipo: 'TRASLADO EXT',
        age_diagnostico: data.observacion,
        age_coordenadas: data.coordenadas,
        age_telefono: data.telefonos,
        age_coment_cliente: data.coordenadas,
      };

      await this.agendaService.postSopAgenda(bodyAge);

      // ✅ asegura conexión (si ya estaba, no pasa nada)
      await this.soketService.connectSocket();

      // ✅ notifica a NOC: backend reenviará trabajoPreagendadoNOC
      this.soketService.emit('trabajoPreagendado');

      await Swal.fire(
        'Éxito',
        'Traslado externo registrado correctamente',
        'success',
      );

      this.TrasladoForm.reset();
      await this.router.navigateByUrl(`/home/noc/agenda`);
    } catch (error: any) {
      console.error('❌ Error al crear el traslado externo:', error);
      Swal.fire(
        'Error',
        error?.message || 'No se pudo registrar el traslado externo',
        'error',
      );
    }
  }

  checkError(controlName: string, error: string): boolean {
    const control = this.TrasladoForm.get(controlName);
    return !!(control?.touched && control.hasError(error));
  }
}
