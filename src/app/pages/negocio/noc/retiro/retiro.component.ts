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
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-retiro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './retiro.component.html',
  styleUrl: './retiro.component.css',
})
export class RetiroComponent {
  retiroForm!: FormGroup;
  agendaService = inject(AgendaService);
  clientesServie = inject(ClientesService);
  router = inject(Router);
  // ✅ Suavizado de render
  isReady = false;

  constructor(
    private fb: FormBuilder,
    private visitaService: VisService,
  ) {
    this.retiroForm = this.fb.group({
      ord_ins: new FormControl<string | null>(null, [
        Validators.required,
        Validators.pattern(/^\d+$/), // solo números
      ]),
      telefonos: new FormControl<string | null>(null, [Validators.required]),
      /*  coordenadas: new FormControl<string | null>(null, [
        Validators.required,
        // Acepta: -0.12345,-78.56789 (con o sin espacios alrededor de la coma)
        Validators.pattern(/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/),
      ]),*/
      observacion: new FormControl<string | null>(null, [Validators.required]),
    });

    // Muestra el contenido (si quieres el doble frame como en otros comps, puedes añadirlo)
    this.isReady = true;
  }

  convertToUppercase(field: string): void {
    const control = this.retiroForm.get(field);
    if (control) {
      const value = String(control.value ?? '');
      control.setValue(value.toUpperCase(), { emitEvent: false });
    }
  }

  async submitForm(): Promise<void> {
    if (this.retiroForm.invalid) {
      this.retiroForm.markAllAsTouched();
      return;
    }

    try {
      const data = this.retiroForm.value; // { ord_ins, telefonos, coordenadas, observacion }
      /*
      // 1) Crear el retiro en la tabla neg_t_vis
      const response = await this.visitaService.createVis({
        ord_ins: data.ord_ins,
        vis_diagnostico: data.observacion,
        vis_tipo: 'RETIRO',
        //   vis_coment_cliente: data.coordenadas,
        vis_estado: 'PENDIENTE',
      });
*/
      const response2 = await this.clientesServie.getInfoServicioByOrdId(
        data.ord_ins,
      );

      // 2) Crear el caso en la tabla neg_t_agenda
      const bodyAge = {
        ord_ins: Number(data.ord_ins),
        age_tipo: 'RETIRO',
        //  age_id_tipo: response.id,
        age_diagnostico: data.observacion,
        age_coordenadas: response2.servicios[0].coordenadas,
        age_telefono: data.telefonos,
      };
      await this.agendaService.postSopAgenda(bodyAge);
      await this.router.navigateByUrl(`/home/noc/agenda`);

      Swal.fire('Éxito', 'Retiro registrado correctamente', 'success');
      this.retiroForm.reset();
    } catch (error: any) {
      console.error('❌ Error al crear el Retiro:', error);
      Swal.fire(
        'Error',
        error?.message || 'No se pudo registrar el retiro',
        'error',
      );
    }
  }

  checkError(controlName: string, error: string): boolean {
    const control = this.retiroForm.get(controlName);
    return !!(control?.touched && control.hasError(error));
  }
}
