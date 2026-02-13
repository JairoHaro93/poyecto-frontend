import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { lastValueFrom } from 'rxjs';
import {
  OltService,
  OltTestResponse,
} from '../../../../services/negocio_latacunga/olt.services';

type Estado = 'IDLE' | 'CONECTANDO' | 'OK' | 'ERROR' | 'COOLDOWN';

@Component({
  selector: 'app-olt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './olt.component.html',
  styleUrl: './olt.component.css',
})
export class OltComponent implements OnDestroy {
  oltForm!: FormGroup;

  oltService = inject(OltService);

  isReady = false;

  estado: Estado = 'IDLE';
  mensaje = '';
  time: string | null = null;
  raw = '';

  cooldownSec = 0;
  private cooldownTimer: any = null;

  constructor(private fb: FormBuilder) {
    this.oltForm = this.fb.group({
      debug: new FormControl<boolean>(false),
    });

    this.isReady = true;
  }

  ngOnDestroy(): void {
    this.clearCooldown();
  }

  async submitForm(): Promise<void> {
    if (this.estado === 'CONECTANDO' || this.estado === 'COOLDOWN') return;

    this.estado = 'CONECTANDO';
    this.mensaje = 'Conectando a la OLT...';
    this.time = null;
    this.raw = '';

    const debug = !!this.oltForm.value.debug;

    try {
      const data = await lastValueFrom(this.oltService.testConnection(debug));

      if (!data?.ok) {
        throw { error: data };
      }

      this.estado = 'OK';
      this.mensaje = data?.message || 'OK';
      this.time = data?.time || null;

      // solo si debug=true el backend manda raw (ideal)
      this.raw = debug ? data?.raw || '' : '';

      await Swal.fire(
        'Conectado',
        this.time ? `Hora OLT: ${this.time}` : 'Conexión OK',
        'success',
      );
    } catch (err: any) {
      // HttpClient: errores vienen como HttpErrorResponse
      const status = err?.status;
      const backendMsg =
        err?.error?.error?.message ||
        err?.error?.message ||
        err?.error?.error ||
        err?.message;

      // ✅ cooldown del backend (429)
      if (status === 429) {
        this.estado = 'COOLDOWN';
        this.mensaje = backendMsg || 'Espera antes de reintentar';
        this.time = null;
        this.raw = '';

        this.startCooldownFromMessage(this.mensaje);

        await Swal.fire('Espera', this.mensaje, 'warning');
        return;
      }

      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo conectar con la OLT';
      this.time = null;
      this.raw = '';

      await Swal.fire('Error', this.mensaje, 'error');
    }
  }

  // ====== UI helpers ======
  get badgeClass(): string {
    switch (this.estado) {
      case 'OK':
        return 'bg-success';
      case 'ERROR':
        return 'bg-danger';
      case 'COOLDOWN':
        return 'bg-warning text-dark';
      case 'CONECTANDO':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }

  get estadoTexto(): string {
    switch (this.estado) {
      case 'OK':
        return 'OK';
      case 'ERROR':
        return 'ERROR';
      case 'COOLDOWN':
        return 'ESPERA';
      case 'CONECTANDO':
        return 'CONECTANDO';
      default:
        return 'IDLE';
    }
  }

  // ====== cooldown ======
  private startCooldownFromMessage(msg: string) {
    this.clearCooldown();

    // Ej: "OLT: espera 23s antes de reintentar"
    const m = /espera\s+(\d+)s/i.exec(msg);
    this.cooldownSec = m ? Number(m[1]) : 30;

    this.cooldownTimer = setInterval(() => {
      this.cooldownSec -= 1;

      if (this.cooldownSec <= 0) {
        this.clearCooldown();
        this.estado = 'IDLE';
        this.mensaje = '';
      } else {
        this.mensaje = `Espera ${this.cooldownSec}s antes de reintentar`;
      }
    }, 1000);
  }

  private clearCooldown() {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = null;
    this.cooldownSec = 0;
  }
}
