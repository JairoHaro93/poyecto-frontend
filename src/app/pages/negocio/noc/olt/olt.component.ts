import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { lastValueFrom } from 'rxjs';
import {
  OltService,
  OntInfoBySnResponse,
} from '../../../../services/negocio_latacunga/olt.services';

type Estado = 'IDLE' | 'CONECTANDO' | 'OK' | 'ERROR' | 'COOLDOWN';

function snOntValidator(control: AbstractControl): ValidationErrors | null {
  const raw = String(control.value ?? '');
  const v = raw.replace(/\s+/g, '').toUpperCase();

  // 16 HEX
  if (/^[0-9A-F]{16}$/.test(v)) return null;

  // 4 letras + 8 HEX, con o sin guion (TPLG934700ED / TPLG-934700ED)
  if (/^[A-Z]{4}-?[0-9A-F]{8}$/.test(v)) return null;

  return { snInvalid: true };
}

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
  result: OntInfoBySnResponse | null = null;

  cooldownSec = 0;
  private cooldownTimer: any = null;

  constructor(private fb: FormBuilder) {
    this.oltForm = this.fb.group({
      sn: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, snOntValidator],
      }),
    });

    this.isReady = true;
  }

  ngOnDestroy(): void {
    this.clearCooldown();
  }

  // ✅ normaliza (quita espacios) y convierte a mayúsculas
  normalizeInput(field: string): void {
    const c = this.oltForm.get(field);
    if (!c) return;
    const v = String(c.value ?? '')
      .replace(/\s+/g, '')
      .toUpperCase();
    c.setValue(v, { emitEvent: false });
  }

  // ✅ convierte TPLG934700ED -> 54504C47934700ED (ASCIIHEX(TPLG) + 934700ED)
  private toHex16(sn: string): string {
    const v = String(sn || '')
      .replace(/\s+/g, '')
      .toUpperCase();
    if (/^[0-9A-F]{16}$/.test(v)) return v;

    const noDash = v.replace(/-/g, '');
    if (/^[A-Z]{4}[0-9A-F]{8}$/.test(noDash)) {
      const pref = noDash.slice(0, 4); // TPLG
      const suf = noDash.slice(4); // 934700ED

      const prefHex = pref
        .split('')
        .map((ch) => ch.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase(); // 54504C47

      return `${prefHex}${suf}`; // 54504C47934700ED
    }

    return v; // (no debería llegar si el validador está bien)
  }

  async consultarOnt(): Promise<void> {
    if (this.estado === 'CONECTANDO' || this.estado === 'COOLDOWN') return;

    if (this.oltForm.invalid) {
      this.oltForm.markAllAsTouched();
      return;
    }

    this.estado = 'CONECTANDO';
    this.mensaje = 'Consultando ONT...';
    this.result = null;

    try {
      const snInput = String(this.oltForm.value.sn || '');
      const snHex16 = this.toHex16(snInput);

      const data = await lastValueFrom(this.oltService.ontInfoBySn(snHex16));
      if (!data?.ok) throw { error: data };

      this.estado = 'OK';
      this.mensaje = 'OK';
      this.result = data;

      await Swal.fire('Listo', `ONT consultada: ${data.sn}`, 'success');
    } catch (err: any) {
      const status = err?.status;
      const backendMsg =
        err?.error?.error?.message ||
        err?.error?.message ||
        err?.error?.error ||
        err?.message;

      if (status === 429) {
        this.estado = 'COOLDOWN';
        this.mensaje = backendMsg || 'Espera antes de reintentar';
        this.result = null;
        this.startCooldownFromMessage(this.mensaje);
        await Swal.fire('Espera', this.mensaje, 'warning');
        return;
      }

      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo consultar la ONT';
      this.result = null;
      await Swal.fire('Error', this.mensaje, 'error');
    }
  }

  checkError(controlName: string, error: string): boolean {
    const c = this.oltForm.get(controlName);
    return !!(c?.touched && c.hasError(error));
  }

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

  private startCooldownFromMessage(msg: string) {
    this.clearCooldown();
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
