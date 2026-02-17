import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
  OntDeleteResponse,
} from '../../../../services/negocio_latacunga/olt.services';

type Estado =
  | 'IDLE' // aún no se ha preparado sesión
  | 'READYING' // preparando sesión /ready
  | 'READY' // ✅ sesión lista
  | 'CONECTANDO' // consultando ONT
  | 'OK' // consulta OK + result
  | 'ERROR'
  | 'COOLDOWN'
  | 'ELIMINANDO';

function snOntValidator(control: AbstractControl): ValidationErrors | null {
  const raw = String(control.value ?? '');
  const v = raw.replace(/\s+/g, '').toUpperCase();

  if (/^[0-9A-F]{16}$/.test(v)) return null;
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
export class OltComponent implements OnInit, OnDestroy {
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

  // dentro del componente

  get isBusy(): boolean {
    return (
      this.estado === 'READYING' ||
      this.estado === 'CONECTANDO' ||
      this.estado === 'COOLDOWN' ||
      this.estado === 'ELIMINANDO'
    );
  }

  // ✅ si quieres “estricto”: solo consultar cuando ya está READY (o ya consultaste OK)
  get canConsultar(): boolean {
    return this.estado === 'READY' || this.estado === 'OK';
  }

  get disableConsultar(): boolean {
    return this.isBusy || !this.canConsultar;
  }

  get disableConectar(): boolean {
    return this.isBusy; // o si quieres permitir conectar en ERROR/IDLE, igual funciona
  }

  get disableEliminar(): boolean {
    return this.isBusy || this.estado === 'IDLE' || !this.result;
  }

  // ✅ Ajuste UX (no backend)
  private readonly DBM_OFFSET_RX = 4.09;

  // ============================
  // Formato UI OLT (fechas + duración)
  // ============================
  private readonly RE_OLT_DT =
    /(\d{2})[\/-](\d{2})[\/-](\d{4})\s+(\d{2}):(\d{2}):(\d{2})(?:\s*([+-]\d{2}:\d{2}))?/;

  private pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

  private formatLocalDateTime(d: Date): string {
    return (
      `${this.pad2(d.getDate())}/${this.pad2(d.getMonth() + 1)}/${d.getFullYear()} ` +
      `${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}:${this.pad2(d.getSeconds())}`
    );
  }

  private parseOltDate(raw: unknown): Date | null {
    if (raw === null || raw === undefined) return null;

    const s = String(raw).trim();
    if (!s) return null;

    // 1) Si viene en ISO, esto funciona directo
    const isoTry = new Date(s);
    if (!Number.isNaN(isoTry.getTime())) return isoTry;

    // 2) Formato típico OLT: "29-12-2025 18:39:49-05:00" o "29/12/2025 18:39:49 -05:00"
    const m = s.match(this.RE_OLT_DT);
    if (!m) return null;

    const [, dd, MM, yyyy, hh, mm, ss, off] = m;
    const iso = `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}${off ?? ''}`;
    const d = new Date(iso);

    return Number.isNaN(d.getTime()) ? null : d;
  }

  private compactDuration(raw: unknown): string {
    const s = String(raw ?? '').trim();
    if (!s) return '—';

    // "48 day(s), 22 hour(s), 29 minute(s), 15 second(s)" => "48d 22h 29m 15s"
    return (
      s
        .replace(/day\(s\)/gi, 'd')
        .replace(/hour\(s\)/gi, 'h')
        .replace(/minute\(s\)/gi, 'm')
        .replace(/second\(s\)/gi, 's')
        .replace(/,/g, '')
        .replace(/\s+/g, ' ')
        .trim() || s
    );
  }

  // ✅ Getter para tu template (InfoSop usa ontResult)
  get lastUpTimeUI(): string {
    const d = this.parseOltDate(this.result?.lastUpTime);
    return d ? this.formatLocalDateTime(d) : '—';
  }

  get lastDyingGaspTimeUI(): string {
    const d = this.parseOltDate(this.result?.lastDyingGaspTime);
    return d ? this.formatLocalDateTime(d) : '—';
  }

  get lastDownTimeUI(): string {
    const d = this.parseOltDate(this.result?.lastDownTime);
    return d ? this.formatLocalDateTime(d) : '—';
  }

  get onlineDurationUI(): string {
    return this.compactDuration(this.result?.onlineDuration);
  }

  private formatLastUp(raw?: string | null): string {
    const s = String(raw ?? '').trim();
    if (!s) return '—';

    const m = s.match(
      /(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})([+-]\d{2}:\d{2})?/,
    );

    if (!m) return s;

    const [, dd, MM, yyyy, hh, mm, ss, tz] = m;
    return `${dd}/${MM}/${yyyy} ${hh}:${mm}:${ss}${tz ? ' ' + tz : ''}`;
  }

  private dbmUI(value: unknown, offset = 0): string {
    if (value === null || value === undefined || value === '')
      return 'sin dato';
    const n = typeof value === 'number' ? value : Number(String(value).trim());
    if (!Number.isFinite(n)) return 'sin dato';
    return `${(n + offset).toFixed(2)} dBm`;
  }

  get rxOntUI(): string {
    return this.dbmUI(this.result?.optical?.rxDbm, this.DBM_OFFSET_RX);
  }

  get txOntUI(): string {
    return this.dbmUI(this.result?.optical?.txDbm, 0);
  }

  get oltRxUI(): string {
    return this.dbmUI(this.result?.optical?.oltRxDbm, 0);
  }

  async ngOnInit(): Promise<void> {
    // ✅ opcional: calentar sesión al entrar
    await this.warmupReady(false);
  }

  ngOnDestroy(): void {
    this.clearCooldown();
  }

  normalizeInput(field: string): void {
    const c = this.oltForm.get(field);
    if (!c) return;
    const v = String(c.value ?? '')
      .replace(/\s+/g, '')
      .toUpperCase();
    c.setValue(v, { emitEvent: false });
  }

  private toHex16(sn: string): string {
    const v = String(sn || '')
      .replace(/\s+/g, '')
      .toUpperCase();
    if (/^[0-9A-F]{16}$/.test(v)) return v;

    const noDash = v.replace(/-/g, '');
    if (/^[A-Z]{4}[0-9A-F]{8}$/.test(noDash)) {
      const pref = noDash.slice(0, 4);
      const suf = noDash.slice(4);

      const prefHex = pref
        .split('')
        .map((ch) => ch.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();

      return `${prefHex}${suf}`;
    }

    return v;
  }

  // ✅ sesión lista si estado es READY u OK (porque OK implica que ya hubo sesión)
  private get sessionReady(): boolean {
    return this.estado === 'READY' || this.estado === 'OK';
  }

  // ===========================
  // READY FLOW (solo estado)
  // ===========================
  async warmupReady(showSwal: boolean = true): Promise<boolean> {
    if (this.estado === 'COOLDOWN' || this.estado === 'ELIMINANDO')
      return false;

    this.estado = 'READYING';
    this.mensaje = 'Conectando a OLT...';

    try {
      const r = await lastValueFrom(this.oltService.ready());
      if (!r?.ok || !r?.ready) throw { error: r };

      this.estado = 'READY';
      this.mensaje = ''; // si quieres, pon "Sesión lista ✅"
      if (showSwal) await Swal.fire('Listo', 'Sesión OLT preparada', 'success');
      return true;
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
        this.startCooldownFromMessage(this.mensaje);
        if (showSwal) await Swal.fire('Espera', this.mensaje, 'warning');
        return false;
      }

      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo preparar la sesión OLT';
      if (showSwal) await Swal.fire('Error', this.mensaje, 'error');
      return false;
    }
  }

  private async ensureReady(): Promise<boolean> {
    if (this.sessionReady) return true;
    const ok = await this.warmupReady(false);
    return ok;
  }

  // ===========================
  // CONSULTAR
  // ===========================
  async consultarOnt(): Promise<void> {
    if (
      this.estado === 'READYING' ||
      this.estado === 'CONECTANDO' ||
      this.estado === 'COOLDOWN' ||
      this.estado === 'ELIMINANDO'
    )
      return;

    if (this.oltForm.invalid) {
      this.oltForm.markAllAsTouched();
      return;
    }

    // ✅ asegura READY antes de consultar
    const okReady = await this.ensureReady();
    if (!okReady) {
      // si no pudo, dejamos estado ERROR/COOLDOWN ya seteado
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

      // 🔁 retry 1 vez: re-warmup y reintento
      const retryable =
        /sesión|prompt|concatenado|corrupta|unknown command/i.test(
          String(backendMsg || ''),
        );

      if (retryable) {
        const warmed = await this.warmupReady(false);
        if (warmed) {
          try {
            const snInput = String(this.oltForm.value.sn || '');
            const snHex16 = this.toHex16(snInput);
            const data2 = await lastValueFrom(
              this.oltService.ontInfoBySn(snHex16),
            );
            if (!data2?.ok) throw { error: data2 };

            this.estado = 'OK';
            this.mensaje = 'OK';
            this.result = data2;
            await Swal.fire('Listo', `ONT consultada: ${data2.sn}`, 'success');
            return;
          } catch {}
        }
      }

      // si falló: forzamos a NO READY para que el usuario reconecte
      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo consultar la ONT';
      this.result = null;
      await Swal.fire('Error', this.mensaje, 'error');
    }
  }

  // ===========================
  // ELIMINAR
  // ===========================
  async eliminarOnt(): Promise<void> {
    if (
      this.estado === 'READYING' ||
      this.estado === 'CONECTANDO' ||
      this.estado === 'COOLDOWN' ||
      this.estado === 'ELIMINANDO'
    )
      return;

    if (!this.result) {
      await Swal.fire('Error', 'Primero debes consultar una ONT', 'warning');
      return;
    }

    // ✅ asegura READY antes de eliminar
    const okReady = await this.ensureReady();
    if (!okReady) return;

    const isOnline =
      String(this.result.runState || '').toLowerCase() === 'online';

    let confirmText = `¿Estás seguro de eliminar esta ONT?<br><br>`;
    confirmText += `<strong>SN:</strong> ${this.result.sn}<br>`;
    confirmText += `<strong>Descripción:</strong> ${this.result.description || 'Sin descripción'}<br>`;
    confirmText += `<strong>F/S/P:</strong> ${this.result.fsp}<br>`;
    confirmText += `<strong>ONT-ID:</strong> ${this.result.ontId}<br>`;

    if (isOnline) {
      confirmText += `<br><span style="color: #f39c12; font-weight: bold;">⚠️ ADVERTENCIA: La ONT está ONLINE</span>`;
    }

    const confirm1 = await Swal.fire({
      title: 'Confirmar Eliminación',
      html: confirmText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm1.isConfirmed) return;

    if (isOnline) {
      const confirm2 = await Swal.fire({
        title: '⚠️ ONT ONLINE',
        html: 'La ONT está <strong>ACTIVA y EN LÍNEA</strong>.<br>Esto afectará al cliente.<br><br>¿Confirmas la eliminación?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, estoy seguro',
        cancelButtonText: 'Cancelar',
      });
      if (!confirm2.isConfirmed) return;
    }

    this.estado = 'ELIMINANDO';
    this.mensaje = 'Eliminando ONT...';

    try {
      const snInput = String(this.oltForm.value.sn || '');
      const snHex16 = this.toHex16(snInput);

      const data: OntDeleteResponse = await lastValueFrom(
        this.oltService.ontDelete(snHex16),
      );
      if (!data?.ok) throw { error: data };

      // después de borrar, seguimos listos para otra acción
      this.estado = 'READY';
      this.mensaje = '';
      this.result = null;
      this.oltForm.reset();

      let successMsg = `<strong>ONT eliminada exitosamente</strong><br><br>`;
      successMsg += `SN: ${data.sn}<br>`;
      successMsg += `F/S/P: ${data.fsp}<br>`;
      successMsg += `ONT-ID: ${data.ontId}<br>`;

      if (data.servicePorts.deleted.length > 0) {
        successMsg += `<br><strong>Service-ports eliminados:</strong><br>`;
        data.servicePorts.deleted.forEach((sp) => {
          if (sp.index) {
            successMsg += `• Index: ${sp.index}, VLAN: ${sp.vlanId}, Estado: ${sp.state}<br>`;
          } else if (sp.warning) {
            successMsg += `• ${sp.warning}<br>`;
          }
        });
      }

      if (data.warning) {
        successMsg += `<br><span style="color: #f39c12;">${data.warning}</span>`;
      }

      await Swal.fire({
        title: 'Eliminación Exitosa',
        html: successMsg,
        icon: 'success',
      });
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
        this.startCooldownFromMessage(this.mensaje);
        await Swal.fire('Espera', this.mensaje, 'warning');
        return;
      }

      if (status === 404) {
        this.estado = 'ERROR';
        this.mensaje = 'La ONT no existe en la OLT';
        await Swal.fire('Error', this.mensaje, 'error');
        return;
      }

      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo eliminar la ONT';
      await Swal.fire('Error', this.mensaje, 'error');
    }
  }

  limpiar(): void {
    this.oltForm.reset();
    this.result = null;
    this.mensaje = '';
    // si ya estabas READY u OK, vuelves a READY; caso contrario vuelves a IDLE
    this.estado = this.sessionReady ? 'READY' : 'IDLE';
  }

  checkError(controlName: string, error: string): boolean {
    const c = this.oltForm.get(controlName);
    return !!(c?.touched && c.hasError(error));
  }

  get badgeClass(): string {
    switch (this.estado) {
      case 'READY':
        return 'bg-success';
      case 'OK':
        return 'bg-success';
      case 'ERROR':
        return 'bg-danger';
      case 'COOLDOWN':
        return 'bg-warning text-dark';
      case 'CONECTANDO':
      case 'READYING':
      case 'ELIMINANDO':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }

  get estadoTexto(): string {
    switch (this.estado) {
      case 'READY':
        return 'READY';
      case 'OK':
        return 'OK';
      case 'ERROR':
        return 'ERROR';
      case 'COOLDOWN':
        return 'ESPERA';
      case 'CONECTANDO':
        return 'CONSULTANDO';
      case 'READYING':
        return 'CONECTANDO OLT';
      case 'ELIMINANDO':
        return 'ELIMINANDO';
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
        // al terminar cooldown volvemos a IDLE (exige reconectar) o quieres READY?
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

  private formatLastUpTime(raw: unknown): string {
    const s = String(raw ?? '').trim();
    if (!s) return '—';

    // Caso típico: "29-12-2025 18:39:49-05:00" (con o sin zona)
    const m = s.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (m) {
      const [, dd, mm, yyyy, hh, mi, ss] = m;
      return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
    }

    // Fallback: quitar zona si viene al final
    return s.replace(/([+-]\d{2}:\d{2})$/, '').trim();
  }
}
