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
  OntAutofindAllItem,
  OntAutofindAllResponse,
  OntProvisionAutofindResponse,
} from '../../../../services/negocio_latacunga/olt.services';

type Tab = 'CONECTAR' | 'CONSULTAS' | 'INGRESO';

type Estado =
  | 'IDLE'
  | 'READYING'
  | 'READY'
  | 'CONECTANDO'
  | 'OK'
  | 'ERROR'
  | 'COOLDOWN'
  | 'ELIMINANDO'
  | 'BUSCANDO'
  | 'INGRESANDO';

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
  private fb = inject(FormBuilder);
  private oltService = inject(OltService);

  tab: Tab = 'CONSULTAS';

  oltForm: FormGroup = this.fb.group({
    sn: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, snOntValidator],
    }),
  });

  ingresoForm: FormGroup = this.fb.group({
    sn: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, snOntValidator],
    }),
    desc: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    trafficIn: new FormControl<number>(98, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    trafficOut: new FormControl<number>(99, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  isReady = true;

  estado: Estado = 'IDLE';
  mensaje = '';
  result: OntInfoBySnResponse | null = null;

  autofindItems: OntAutofindAllItem[] = [];
  provisionResult: OntProvisionAutofindResponse | null = null;

  cooldownSec = 0;
  private cooldownTimer: any = null;

  // READY TTL
  private lastReadyAt = 0;
  private readonly READY_TTL_MS = 120_000;

  private markReadyNow(): void {
    this.lastReadyAt = Date.now();
  }

  private get sessionReady(): boolean {
    const localOk = this.estado === 'READY' || this.estado === 'OK';
    if (!localOk) return false;
    return Date.now() - this.lastReadyAt < this.READY_TTL_MS;
  }

  // UX Rx compensation (solo front)
  private readonly DBM_OFFSET_RX = 4.09;

  // Formato UI OLT
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

    const looksIso =
      /^\d{4}-\d{2}-\d{2}T/.test(s) ||
      /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(s);

    if (looksIso) {
      const d1 = new Date(s);
      if (!Number.isNaN(d1.getTime())) return d1;
    }

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

  // UI state helpers
  get isBusy(): boolean {
    return (
      this.estado === 'READYING' ||
      this.estado === 'CONECTANDO' ||
      this.estado === 'COOLDOWN' ||
      this.estado === 'ELIMINANDO' ||
      this.estado === 'BUSCANDO' ||
      this.estado === 'INGRESANDO'
    );
  }

  get canConsultar(): boolean {
    return this.estado === 'READY' || this.estado === 'OK';
  }

  get disableConsultar(): boolean {
    return this.isBusy || !this.canConsultar;
  }

  get disableConectar(): boolean {
    return this.isBusy;
  }

  get disableEliminar(): boolean {
    return this.isBusy || this.estado === 'IDLE' || !this.result;
  }

  get disableIngresar(): boolean {
    return this.isBusy || !this.canConsultar || this.ingresoForm.invalid;
  }

  private extractBackendMsg(err: any): string {
    return (
      err?.error?.error?.message ||
      err?.error?.message ||
      err?.error?.error ||
      err?.message ||
      'Error'
    );
  }

  private isRetryableOltMsg(msg: unknown): boolean {
    const s = String(msg ?? '').toLowerCase();
    return /sesion|sesión|prompt|concatenad|corrupt|unknown command|not.*mode|invalid/i.test(
      s,
    );
  }

  async ngOnInit(): Promise<void> {
    // Si quieres que el tab “Consultas” haga auto-ready al entrar:
    await this.warmupReady(false);
  }

  ngOnDestroy(): void {
    this.clearCooldown();
  }

  setTab(t: Tab): void {
    this.tab = t;

    // opcional: si entro a Consultas/Ingreso y estoy IDLE, hago warmup silencioso
    if ((t === 'CONSULTAS' || t === 'INGRESO') && this.estado === 'IDLE') {
      this.warmupReady(false);
    }
  }

  normalizeInput(field: string): void {
    const c = this.oltForm.get(field);
    if (!c) return;
    const v = String(c.value ?? '')
      .replace(/\s+/g, '')
      .toUpperCase();
    c.setValue(v, { emitEvent: false });
  }

  normalizeIngresoSn(): void {
    const c = this.ingresoForm.get('sn');
    if (!c) return;
    const v = String(c.value ?? '')
      .replace(/\s+/g, '')
      .toUpperCase();
    c.setValue(v, { emitEvent: false });
  }

  normalizeIngresoDesc(): void {
    const c = this.ingresoForm.get('desc');
    if (!c) return;

    // desc: MAYUS + espacios->_ + limpiar dobles __
    const v = String(c.value ?? '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_');

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

  // READY
  async warmupReady(showSwal: boolean = true): Promise<boolean> {
    if (this.estado === 'COOLDOWN' || this.estado === 'ELIMINANDO')
      return false;

    this.estado = 'READYING';
    this.mensaje = 'Conectando a OLT...';

    try {
      const r = await lastValueFrom(this.oltService.ready());
      if (!r?.ok || !r?.ready) throw { error: r };

      this.estado = 'READY';
      this.mensaje = '';
      this.markReadyNow();
      if (showSwal) await Swal.fire('Listo', 'Sesión OLT preparada', 'success');
      return true;
    } catch (err: any) {
      const status = err?.status;
      const backendMsg = this.extractBackendMsg(err);

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
    return this.warmupReady(false);
  }

  // CONSULTAR (tu lógica igual)
  async consultarOnt(): Promise<void> {
    if (this.isBusy) return;

    if (this.oltForm.invalid) {
      this.oltForm.markAllAsTouched();
      return;
    }

    const okReady = await this.ensureReady();
    if (!okReady) return;

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
      this.markReadyNow();

      await Swal.fire('Listo', `ONT consultada: ${data.sn}`, 'success');
    } catch (err: any) {
      const status = err?.status;
      const backendMsg = this.extractBackendMsg(err);

      if (status === 429) {
        this.estado = 'COOLDOWN';
        this.mensaje = backendMsg || 'Espera antes de reintentar';
        this.result = null;
        this.startCooldownFromMessage(this.mensaje);
        await Swal.fire('Espera', this.mensaje, 'warning');
        return;
      }

      if (this.isRetryableOltMsg(backendMsg)) {
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
            this.markReadyNow();
            await Swal.fire('Listo', `ONT consultada: ${data2.sn}`, 'success');
            return;
          } catch {}
        }
      }

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
    if (this.isBusy) return;

    if (!this.result) {
      await Swal.fire('Error', 'Primero debes consultar una ONT', 'warning');
      return;
    }

    const isOnline =
      String(this.result.runState || '').toLowerCase() === 'online';

    // confirmaciones
    let confirmText = `¿Estás seguro de eliminar esta ONT?<br><br>`;
    confirmText += `<strong>SN:</strong> ${this.result.sn}<br>`;
    confirmText += `<strong>Descripción:</strong> ${this.result.description || 'Sin descripción'}<br>`;
    confirmText += `<strong>F/S/P:</strong> ${this.result.fsp}<br>`;
    confirmText += `<strong>ONT-ID:</strong> ${this.result.ontId}<br>`;
    if (isOnline) {
      confirmText += `<br><span style="color:#f39c12;font-weight:700;">⚠️ ADVERTENCIA: La ONT está ONLINE</span>`;
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

    // ✅ IMPORTANTÍSIMO: asegurar READY ANTES de poner ELIMINANDO
    const okReady = await this.ensureReady();
    if (!okReady) return;

    this.estado = 'ELIMINANDO';
    this.mensaje = 'Eliminando ONT...';

    const snHex16 = this.toHex16(String(this.result.sn || ''));

    const attemptDelete = async (): Promise<OntDeleteResponse> => {
      const data: OntDeleteResponse = await lastValueFrom(
        this.oltService.ontDelete(snHex16),
      );
      if (!data?.ok) throw { error: data };
      return data;
    };

    try {
      // ✅ “smart retry” para tu caso (a veces la 1ra devuelve ok:false y la 2da ok:true)
      let data: OntDeleteResponse;
      try {
        data = await attemptDelete();
      } catch (e1: any) {
        const msg1 = this.extractBackendMsg(e1);
        if (/extraer\s+f\/s\/p|ont-id/i.test(String(msg1).toLowerCase())) {
          await new Promise((r) => setTimeout(r, 500));
          data = await attemptDelete();
        } else {
          throw e1;
        }
      }

      // éxito
      this.estado = 'READY';
      this.mensaje = '';
      this.result = null;
      this.oltForm.reset();
      this.markReadyNow();

      let successMsg = `<strong>ONT eliminada exitosamente</strong><br><br>`;
      successMsg += `SN: ${data.sn}<br>`;
      successMsg += `F/S/P: ${data.fsp}<br>`;
      successMsg += `ONT-ID: ${data.ontId}<br>`;

      if (data.servicePorts?.deleted?.length > 0) {
        successMsg += `<br><strong>Service-ports eliminados:</strong><br>`;
        data.servicePorts.deleted.forEach((sp: any) => {
          if (sp.index)
            successMsg += `• Index: ${sp.index}, VLAN: ${sp.vlanId}, Estado: ${sp.state}<br>`;
          else if (sp.warning) successMsg += `• ${sp.warning}<br>`;
        });
      }

      if (data.warning) {
        successMsg += `<br><span style="color:#f39c12;">${data.warning}</span>`;
      }

      await Swal.fire({
        title: 'Eliminación Exitosa',
        html: successMsg,
        icon: 'success',
      });
    } catch (err: any) {
      const status = err?.status;
      const backendMsg = this.extractBackendMsg(err);

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

      // retry 1 vez por sesión/prompt
      if (this.isRetryableOltMsg(backendMsg)) {
        const warmed = await this.warmupReady(false);
        if (warmed) {
          try {
            const data2 = await attemptDelete();

            this.estado = 'READY';
            this.mensaje = '';
            this.result = null;
            this.oltForm.reset();
            this.markReadyNow();

            await Swal.fire(
              'Eliminación Exitosa',
              `ONT eliminada: ${data2.sn}`,
              'success',
            );
            return;
          } catch {}
        }
      }

      console.error('❌ Delete failed:', err);
      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo eliminar la ONT';
      await Swal.fire('Error', this.mensaje, 'error');
    }
  }

  // ========= INGRESO: AUTOFIND + PROVISION =========
  async buscarAutofind(): Promise<void> {
    if (this.isBusy) return;

    const okReady = await this.ensureReady();
    if (!okReady) return;

    this.estado = 'BUSCANDO';
    this.mensaje = 'Buscando autofind...';

    try {
      const data: OntAutofindAllResponse = await lastValueFrom(
        this.oltService.ontAutofindAll(),
      );
      if (!data?.ok) throw { error: data };

      this.autofindItems = data.items || [];
      this.estado = 'READY';
      this.mensaje = '';
      this.markReadyNow();
    } catch (err: any) {
      const backendMsg = this.extractBackendMsg(err);
      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo listar autofind';
      await Swal.fire('Error', this.mensaje, 'error');
    }
  }

  selectAutofind(it: OntAutofindAllItem): void {
    this.ingresoForm.patchValue({ sn: it.snHex });
    this.normalizeIngresoSn();
  }

  async ingresarOnt(): Promise<void> {
    if (this.isBusy) return;

    if (this.ingresoForm.invalid) {
      this.ingresoForm.markAllAsTouched();
      return;
    }

    const okReady = await this.ensureReady();
    if (!okReady) return;

    this.estado = 'INGRESANDO';
    this.mensaje = 'Ingresando ONT...';
    this.provisionResult = null;

    try {
      const snHex16 = this.toHex16(String(this.ingresoForm.value.sn || ''));
      const desc = String(this.ingresoForm.value.desc || '').trim();
      const trafficIn = Number(this.ingresoForm.value.trafficIn);
      const trafficOut = Number(this.ingresoForm.value.trafficOut);

      const data = await lastValueFrom(
        this.oltService.ontProvisionAutofind(
          snHex16,
          desc,
          trafficIn,
          trafficOut,
        ),
      );
      if (!data?.ok) throw { error: data };

      this.estado = 'READY';
      this.mensaje = '';
      this.provisionResult = data;
      this.markReadyNow();

      await Swal.fire(
        'Listo',
        `ONT ingresada: ${data.sn} (ONT-ID ${data.ontId})`,
        'success',
      );
    } catch (err: any) {
      const status = err?.status;
      const backendMsg = this.extractBackendMsg(err);

      if (status === 429) {
        this.estado = 'COOLDOWN';
        this.mensaje = backendMsg || 'Espera antes de reintentar';
        this.startCooldownFromMessage(this.mensaje);
        await Swal.fire('Espera', this.mensaje, 'warning');
        return;
      }

      if (this.isRetryableOltMsg(backendMsg)) {
        const warmed = await this.warmupReady(false);
        if (warmed) {
          try {
            const snHex16 = this.toHex16(
              String(this.ingresoForm.value.sn || ''),
            );
            const desc = String(this.ingresoForm.value.desc || '').trim();
            const trafficIn = Number(this.ingresoForm.value.trafficIn);
            const trafficOut = Number(this.ingresoForm.value.trafficOut);

            const data2 = await lastValueFrom(
              this.oltService.ontProvisionAutofind(
                snHex16,
                desc,
                trafficIn,
                trafficOut,
              ),
            );
            if (!data2?.ok) throw { error: data2 };

            this.estado = 'READY';
            this.mensaje = '';
            this.provisionResult = data2;
            this.markReadyNow();
            await Swal.fire('Listo', `ONT ingresada: ${data2.sn}`, 'success');
            return;
          } catch {}
        }
      }

      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo ingresar la ONT';
      await Swal.fire('Error', this.mensaje, 'error');
    }
  }

  irAConsultasConSn(sn: string): void {
    this.tab = 'CONSULTAS';
    this.oltForm.patchValue({ sn });
    this.normalizeInput('sn');
    this.consultarOnt();
  }

  // Limpieza por tab
  limpiarConsultas(): void {
    this.oltForm.reset();
    this.result = null;
    this.mensaje = '';
    this.estado = this.sessionReady ? 'READY' : 'IDLE';
  }

  limpiarIngreso(): void {
    this.ingresoForm.reset({ sn: '', desc: '', trafficIn: 98, trafficOut: 99 });
    this.autofindItems = [];
    this.provisionResult = null;
    this.mensaje = '';
    this.estado = this.sessionReady ? 'READY' : 'IDLE';
  }

  limpiarTodo(): void {
    this.limpiarConsultas();
    this.limpiarIngreso();
  }

  checkError(controlName: string, error: string): boolean {
    const c = this.oltForm.get(controlName);
    return !!(c?.touched && c.hasError(error));
  }

  checkIngresoError(controlName: string, error: string): boolean {
    const c = this.ingresoForm.get(controlName);
    return !!(c?.touched && c.hasError(error));
  }

  get badgeClass(): string {
    switch (this.estado) {
      case 'READY':
      case 'OK':
        return 'bg-success';
      case 'ERROR':
        return 'bg-danger';
      case 'COOLDOWN':
        return 'bg-warning text-dark';
      case 'CONECTANDO':
      case 'READYING':
      case 'ELIMINANDO':
      case 'BUSCANDO':
      case 'INGRESANDO':
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
      case 'BUSCANDO':
        return 'BUSCANDO';
      case 'INGRESANDO':
        return 'INGRESANDO';
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
