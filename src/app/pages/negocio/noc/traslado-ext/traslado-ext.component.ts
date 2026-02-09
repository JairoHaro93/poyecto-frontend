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
// import { InstalacionesService } from '../../../../services/negocio_latacunga/instalaciones.service'; // ❌ No usado
import { VisService } from '../../../../services/negocio_latacunga/vis.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-traslado-ext',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './traslado-ext.component.html',
  styleUrls: ['./traslado-ext.component.css'], // plural recomendado
})
export class TrasladoExtComponent {
  TrasladoForm!: FormGroup;
  agendaService = inject(AgendaService);

  // ✅ Suavizado de render
  isReady = false;
  router = inject(Router);
  constructor(
    private fb: FormBuilder,
    private visitaService: VisService,
  ) {
    this.TrasladoForm = this.fb.group({
      ord_ins: new FormControl<string | null>(null, [
        Validators.required,
        Validators.pattern(/^\d+$/), // solo números
      ]),
      telefonos: new FormControl<string | null>(null, [Validators.required]),
      coordenadas: new FormControl<string | null>(null, [
        Validators.required,
        // Acepta: -0.12345,-78.56789 (con o sin espacios alrededor de la coma)
        Validators.pattern(/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/),
      ]),
      observacion: new FormControl<string | null>(null, [Validators.required]),
    });

    // Muestra el contenido (si quieres el doble frame como en otros comps, puedes añadirlo)
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
      const data = this.TrasladoForm.value; // { ord_ins, telefonos, coordenadas, observacion }
      /*
      // 1) Crear el traslado en la tabla neg_t_vis
      const response = await this.visitaService.createVis({
        ord_ins: data.ord_ins,
        vis_diagnostico: data.observacion,
        vis_tipo: 'TRASLADO EXT',
        vis_coment_cliente: data.coordenadas,
        vis_estado: 'PENDIENTE',
      });
*/
      // 2) Crear el caso en la tabla neg_t_agenda
      const bodyAge = {
        ord_ins: Number(data.ord_ins),
        age_tipo: 'TRASLADO EXT',
        // age_id_tipo: response.id, // asegúrate que el backend devuelva { id }
        age_diagnostico: data.observacion,
        age_coordenadas: data.coordenadas,
        age_telefono: data.telefonos,
        age_coment_cliente: data.coordenadas,
      };
      await this.agendaService.postSopAgenda(bodyAge);
      await this.router.navigateByUrl(`/home/noc/agenda`);
      Swal.fire(
        'Éxito',
        'Traslado externo registrado correctamente',
        'success',
      );
      this.TrasladoForm.reset();
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
