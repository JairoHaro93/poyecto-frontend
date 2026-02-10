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
  soketService = inject(SoketService); // ✅
  router = inject(Router);

  isReady = false;

  constructor(
    private fb: FormBuilder,
    private visitaService: VisService,
  ) {
    this.retiroForm = this.fb.group({
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
      const data = this.retiroForm.value;

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
        age_tipo: 'RETIRO',
        age_diagnostico: data.observacion,
        age_coordenadas: coord,
        age_telefono: data.telefonos,
      };

      await this.agendaService.postSopAgenda(bodyAge);

      // ✅ asegura conexión (si ya está conectado, no hace nada)
      await this.soketService.connectSocket();

      // ✅ notifica a NOC: backend hará -> trabajoPreagendadoNOC a sala_NOC
      this.soketService.emit('trabajoPreagendado');

      // ✅ mejor UX: primero mensaje y luego navega
      await Swal.fire('Éxito', 'Retiro registrado correctamente', 'success');

      this.retiroForm.reset();
      await this.router.navigateByUrl(`/home/noc/agenda`);
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
