import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MapaOltComponent } from './mapa-olt/mapa-olt.component';
import { CajasService } from '../../../../services/negocio_latacunga/cajas.services';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { lastValueFrom, of, from } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';
import {
  OltService,
  OntInfoBySnResponse,
  OntDeleteResponse,
  OntAutofindAllItem,
  OntAutofindAllResponse,
  OntProvisionAutofindResponse,
} from '../../../../services/negocio_latacunga/olt.services';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';

type Tab = 'CONSULTAS' | 'INGRESO';

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

interface ClienteSugerencia {
  cedula: string;
  nombre_completo: string;
}

type ServicioIngresoItem = {
  ord_ins: number;
  direccion: string;
  referencia: string;
  plan_contratado: string;
  nombre_completo: string;
  cedula: string;
};

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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MapaOltComponent],
  templateUrl: './olt.component.html',
  styleUrl: './olt.component.css',
})
export class OltComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private oltService = inject(OltService);
  private clientesService = inject(ClientesService);
  private cajasService = inject(CajasService);
  tab: Tab = 'CONSULTAS';

  @Input() selectedOltId: number | null = null;
  @Input() selectedOltNombre: string | null = null;

  // =========================
  // INICIO PLANES HARCODEADOS
  // =========================

  private normalizePlanName(plan: string): string {
    return String(plan || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ');
  }

  private getTrafficProfileByPlan(plan: string): {
    trafficIn: number;
    trafficOut: number;
  } | null {
    const p = this.normalizePlanName(plan);

    const map: Record<string, { trafficIn: number; trafficOut: number }> = {
      'HOGAR FIBRA COMUNIDAD': { trafficIn: 40, trafficOut: 41 },
      'FIBRA HOGAR 1': { trafficIn: 40, trafficOut: 41 },
      'FIBRA HOGAR 2': { trafficIn: 50, trafficOut: 51 },
      'FIBRA HOGAR 3': { trafficIn: 60, trafficOut: 61 },
      'FIBRA HOGAR 4': { trafficIn: 70, trafficOut: 71 },
      'FIBRA 1 PROMOCIONAL 1000 MB': { trafficIn: 98, trafficOut: 99 },
    };

    return map[p] ?? null;
  }

  private applyTrafficProfileFromSelectedService(): void {
    const plan = this.servicioSeleccionado?.plan_contratado || '';
    const profile = this.getTrafficProfileByPlan(plan);

    if (profile) {
      this.ingresoForm.patchValue(
        {
          trafficIn: profile.trafficIn,
          trafficOut: profile.trafficOut,
        },
        { emitEvent: false },
      );
      return;
    }

    // fallback por defecto si no encuentra coincidencia
    this.ingresoForm.patchValue(
      {
        trafficIn: 98,
        trafficOut: 99,
      },
      { emitEvent: false },
    );
  }

  // =========================
  // FIN PLANES HARCODEADOS
  // =========================

  // =========================
  // CONSULTAS
  // =========================
  oltForm: FormGroup = this.fb.group({
    sn: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, snOntValidator],
    }),
  });
  oltsDisponibles: Array<{
    id: number;
    olt_nombre: string;
    olt_ciudad?: string;
  }> = [];
  loadingOlts = false;
  // =========================
  // INGRESO
  // =========================
  ingresoForm: FormGroup = this.fb.group({
    trafficIn: new FormControl<number>(98, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    trafficOut: new FormControl<number>(99, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  busquedaCtrl = new FormControl<string>('', { nonNullable: true });
  nombresFiltrados: ClienteSugerencia[] = [];
  showSugerencias = false;
  highlightedIndex = -1;
  busquedaCedula = '';

  loadingServicios = false;
  clienteSeleccionado: Iclientes | null = null;
  serviciosEncontrados: ServicioIngresoItem[] = [];
  servicioSeleccionado: ServicioIngresoItem | null = null;

  showMapaModal = false;

  cajaSeleccionada: {
    cajaId: number;
    cajaNombre: string;
    cajaTipo: string;
    oltId: number | null;
    oltNombre?: string | null;
  } | null = null;

  autofindItems: OntAutofindAllItem[] = [];
  autofindSeleccionada: OntAutofindAllItem | null = null;
  loadingAutofind = false;

  provisionResult: OntProvisionAutofindResponse | null = null;

  // =========================
  // GENERAL
  // =========================
  isReady = true;
  estado: Estado = 'IDLE';
  mensaje = '';
  result: OntInfoBySnResponse | null = null;

  cooldownSec = 0;
  private cooldownTimer: any = null;

  private lastReadyAt = 0;
  private readonly READY_TTL_MS = 120_000;
  private readonly DBM_OFFSET_RX = 4.09;

  private readonly RE_OLT_DT =
    /(\d{2})[\/-](\d{2})[\/-](\d{4})\s+(\d{2}):(\d{2}):(\d{2})(?:\s*([+-]\d{2}:\d{2}))?/;

  ngOnInit(): void {
    void this.cargarOlts();

    if (this.hasSelectedOlt) {
      void this.warmupReady(false);
    }

    this.busquedaCtrl.valueChanges
      .pipe(
        map((v) => (v ?? '').trim()),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((v) => {
          if (v.length < 2) {
            this.clearServicioRelacionado();
            this.nombresFiltrados = [];
            this.showSugerencias = false;
            this.highlightedIndex = -1;
            return of([] as ClienteSugerencia[]);
          }

          this.loadingServicios = true;

          return from(this.clientesService.buscarClientesActivos(v, 10)).pipe(
            catchError(() => of([] as ClienteSugerencia[])),
          );
        }),
      )
      .subscribe((list) => {
        this.nombresFiltrados = list;
        this.showSugerencias = list.length > 0;
        this.highlightedIndex = list.length ? 0 : -1;
        this.loadingServicios = false;
      });
  }

  ngOnDestroy(): void {
    this.clearCooldown();
  }

  // =========================
  // OLT helpers
  // =========================
  setSelectedOlt(oltId: number | null, oltNombre?: string | null): void {
    const prev = this.selectedOltId;
    this.selectedOltId = oltId;
    this.selectedOltNombre = oltNombre ?? this.selectedOltNombre;

    if (prev !== this.selectedOltId) {
      this.autofindItems = [];
      this.autofindSeleccionada = null;
      this.provisionResult = null;

      this.estado = this.hasSelectedOlt ? 'IDLE' : 'ERROR';
      this.mensaje = this.hasSelectedOlt
        ? ''
        : 'Selecciona una caja/OLT antes de operar';
    }
  }

  get hasSelectedOlt(): boolean {
    return (
      Number.isFinite(this.selectedOltId) && Number(this.selectedOltId) > 0
    );
  }

  get currentOltLabel(): string {
    if (!this.hasSelectedOlt) return 'Sin OLT seleccionada';
    return this.selectedOltNombre
      ? `${this.selectedOltNombre} `
      : `OLT #${this.selectedOltId}`;
  }

  private requireSelectedOlt(showAlert = true): boolean {
    if (this.hasSelectedOlt) return true;

    this.estado = 'ERROR';
    this.mensaje = 'Selecciona una caja/OLT antes de operar';

    if (showAlert) {
      void Swal.fire(
        'OLT no seleccionada',
        'Primero debes seleccionar una caja que tenga OLT asociada.',
        'warning',
      );
    }
    return false;
  }

  private markReadyNow(): void {
    this.lastReadyAt = Date.now();
  }

  private get sessionReady(): boolean {
    const localOk = this.estado === 'READY' || this.estado === 'OK';
    if (!localOk) return false;
    return Date.now() - this.lastReadyAt < this.READY_TTL_MS;
  }

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
    return (
      this.hasSelectedOlt && (this.estado === 'READY' || this.estado === 'OK')
    );
  }

  get disableConsultar(): boolean {
    return this.isBusy || !this.canConsultar;
  }

  get disableEliminar(): boolean {
    return this.isBusy || this.estado === 'IDLE' || !this.result;
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

  async warmupReady(showSwal: boolean = true): Promise<boolean> {
    if (!this.requireSelectedOlt(showSwal)) return false;
    if (this.estado === 'COOLDOWN' || this.estado === 'ELIMINANDO')
      return false;

    this.estado = 'READYING';
    this.mensaje = `Conectando a ${this.currentOltLabel}...`;

    try {
      const r = await lastValueFrom(
        this.oltService.ready(Number(this.selectedOltId)),
      );
      if (!r?.ok || !r?.ready) throw { error: r };

      this.estado = 'READY';
      this.mensaje = '';
      this.markReadyNow();

      if (r?.olt?.nombre) {
        this.selectedOltNombre = r.olt.nombre;
      }

      if (showSwal) {
        await Swal.fire(
          'Listo',
          `Sesión OLT preparada en ${this.currentOltLabel}`,
          'success',
        );
      }
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
    if (!this.requireSelectedOlt(true)) return false;
    if (this.sessionReady) return true;
    return this.warmupReady(false);
  }

  // =========================
  // CONSULTAS
  // =========================
  setTab(t: Tab): void {
    this.tab = t;

    if (
      this.hasSelectedOlt &&
      (t === 'CONSULTAS' || t === 'INGRESO') &&
      this.estado === 'IDLE'
    ) {
      void this.warmupReady(false);
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

  async consultarOnt(): Promise<void> {
    if (this.isBusy) return;
    if (!this.requireSelectedOlt()) return;

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

      const data = await lastValueFrom(
        this.oltService.ontInfoBySn(Number(this.selectedOltId), snHex16),
      );
      if (!data?.ok) throw { error: data };

      this.estado = 'OK';
      this.mensaje = 'OK';
      this.result = data;
      this.markReadyNow();

      if (data?.olt?.nombre) {
        this.selectedOltNombre = data.olt.nombre;
      }

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

      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo consultar la ONT';
      this.result = null;
      await Swal.fire('Error', this.mensaje, 'error');
    }
  }

  async eliminarOnt(): Promise<void> {
    if (this.isBusy) return;
    if (!this.requireSelectedOlt()) return;

    if (!this.result) {
      await Swal.fire('Error', 'Primero debes consultar una ONT', 'warning');
      return;
    }

    const isOnline =
      String(this.result.runState || '').toLowerCase() === 'online';

    let confirmText = `¿Estás seguro de eliminar esta ONT?<br><br>`;
    confirmText += `<strong>SN:</strong> ${this.result.sn}<br>`;
    confirmText += `<strong>Descripción:</strong> ${this.result.description || 'Sin descripción'}<br>`;
    confirmText += `<strong>F/S/P:</strong> ${this.result.fsp}<br>`;
    confirmText += `<strong>ONT-ID:</strong> ${this.result.ontId}<br>`;
    confirmText += `<strong>OLT:</strong> ${this.currentOltLabel}<br>`;
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

    const okReady = await this.ensureReady();
    if (!okReady) return;

    this.estado = 'ELIMINANDO';
    this.mensaje = 'Eliminando ONT...';

    const snHex16 = this.toHex16(String(this.result.sn || ''));

    try {
      const data: OntDeleteResponse = await lastValueFrom(
        this.oltService.ontDelete(Number(this.selectedOltId), snHex16),
      );
      if (!data?.ok) throw { error: data };

      this.estado = 'READY';
      this.mensaje = '';
      this.result = null;
      this.oltForm.reset();
      this.markReadyNow();

      await Swal.fire(
        'Eliminación Exitosa',
        `ONT eliminada: ${data.sn}`,
        'success',
      );
    } catch (err: any) {
      const backendMsg = this.extractBackendMsg(err);
      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo eliminar la ONT';
      await Swal.fire('Error', this.mensaje, 'error');
    }
  }

  irAConsultasConSn(sn: string): void {
    this.tab = 'CONSULTAS';
    this.oltForm.patchValue({ sn });
    this.normalizeInput('sn');
    void this.consultarOnt();
  }

  // =========================
  // INGRESO: búsqueda cliente/servicios
  // =========================
  private clearServicioRelacionado(): void {
    this.busquedaCedula = '';
    this.clienteSeleccionado = null;
    this.serviciosEncontrados = [];
    this.servicioSeleccionado = null;

    this.cajaSeleccionada = null;
    this.selectedOltId = null;
    this.selectedOltNombre = null;
    this.autofindItems = [];
    this.autofindSeleccionada = null;
    this.provisionResult = null;
  }

  async seleccionarNombre(c: ClienteSugerencia): Promise<void> {
    this.busquedaCtrl.setValue(c.nombre_completo, { emitEvent: false });
    this.busquedaCedula = c.cedula;
    this.nombresFiltrados = [];
    this.showSugerencias = false;
    this.highlightedIndex = -1;

    await this.cargarDetalleClientePorCedula();
  }

  onNombreKeydown(event: KeyboardEvent): void {
    if (!this.showSugerencias || this.nombresFiltrados.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        this.highlightedIndex =
          (this.highlightedIndex + 1) % this.nombresFiltrados.length;
        event.preventDefault();
        break;

      case 'ArrowUp':
        this.highlightedIndex =
          (this.highlightedIndex + this.nombresFiltrados.length - 1) %
          this.nombresFiltrados.length;
        event.preventDefault();
        break;

      case 'Enter':
        if (this.highlightedIndex >= 0) {
          void this.seleccionarNombre(
            this.nombresFiltrados[this.highlightedIndex],
          );
          event.preventDefault();
        }
        break;

      case 'Escape':
        this.showSugerencias = false;
        this.highlightedIndex = -1;
        event.preventDefault();
        break;
    }
  }

  onInputBlur(): void {
    setTimeout(() => (this.showSugerencias = false), 150);
  }

  onInputFocus(): void {
    const v = (this.busquedaCtrl.value ?? '').trim();
    if (v.length >= 2 && this.nombresFiltrados.length > 0) {
      this.showSugerencias = true;
    }
  }

  async cargarDetalleClientePorCedula(): Promise<void> {
    const cedula = this.busquedaCedula.trim();
    if (!cedula) return;

    this.loadingServicios = true;

    try {
      const detalle =
        await this.clientesService.getInfoClientesArrayActivos(cedula);

      if (!detalle?.servicios?.length) {
        this.clienteSeleccionado = null;
        this.serviciosEncontrados = [];
        this.servicioSeleccionado = null;
        return;
      }

      this.clienteSeleccionado = detalle;

      this.serviciosEncontrados = detalle.servicios.map((s) => ({
        ord_ins: Number(s.orden_instalacion ?? 0),
        direccion: String(s.direccion || '').trim(),
        referencia: String(s.referencia || '').trim(),
        plan_contratado: String(s.plan_nombre || '').trim(),
        nombre_completo: String(detalle.nombre_completo || '').trim(),
        cedula: String(detalle.cedula || '').trim(),
      }));

      // limpiar dependencias antes de autoseleccionar
      this.servicioSeleccionado = null;
      this.cajaSeleccionada = null;
      this.selectedOltId = null;
      this.selectedOltNombre = null;
      this.autofindItems = [];
      this.autofindSeleccionada = null;
      this.provisionResult = null;

      if (this.serviciosEncontrados.length === 1) {
        this.seleccionarServicio(this.serviciosEncontrados[0]);
      }
    } catch (error) {
      console.error('Error al cargar detalle del cliente:', error);
      this.clienteSeleccionado = null;
      this.serviciosEncontrados = [];
      this.servicioSeleccionado = null;
    } finally {
      this.loadingServicios = false;
    }
  }
  /*
  seleccionarServicio(item: ServicioIngresoItem): void {
    this.servicioSeleccionado = item;
    this.cajaSeleccionada = null;
    this.selectedOltId = null;
    this.selectedOltNombre = null;
    this.autofindItems = [];
    this.autofindSeleccionada = null;
    this.provisionResult = null;
    this.mensaje = '';
    this.estado = 'IDLE';
  }
*/

  // FUNCION HARCODEADA
  seleccionarServicio(item: ServicioIngresoItem): void {
    this.servicioSeleccionado = item;
    this.cajaSeleccionada = null;
    this.selectedOltId = null;
    this.selectedOltNombre = null;
    this.autofindItems = [];
    this.autofindSeleccionada = null;
    this.provisionResult = null;
    this.mensaje = '';
    this.estado = 'IDLE';

    this.applyTrafficProfileFromSelectedService();
  }

  abrirMapaModal(): void {
    if (!this.servicioSeleccionado) {
      void Swal.fire(
        'Servicio requerido',
        'Primero debes seleccionar un servicio.',
        'warning',
      );
      return;
    }
    this.showMapaModal = true;
  }

  cerrarMapaModal(): void {
    this.showMapaModal = false;
  }

  onCajaOltSelected(ev: {
    cajaId: number;
    cajaNombre: string;
    cajaTipo: string;
    oltId: number | null;
    oltNombre?: string | null;
  }): void {
    this.cajaSeleccionada = ev;
    this.setSelectedOlt(ev.oltId, ev.oltNombre ?? null);
    this.showMapaModal = false;
    void this.buscarAutofind();
  }

  // =========================
  // INGRESO: autofind + provisión
  // =========================
  async buscarAutofind(): Promise<void> {
    if (this.isBusy) return;
    if (!this.requireSelectedOlt()) return;

    const okReady = await this.ensureReady();
    if (!okReady) return;

    this.estado = 'BUSCANDO';
    this.mensaje = 'Buscando autofind...';
    this.loadingAutofind = true;
    this.autofindItems = [];
    this.autofindSeleccionada = null;

    try {
      const data: OntAutofindAllResponse = await lastValueFrom(
        this.oltService.ontAutofindAll(Number(this.selectedOltId)),
      );
      if (!data?.ok) throw { error: data };

      this.autofindItems = data.items || [];
      if (this.autofindItems.length === 1) {
        this.autofindSeleccionada = this.autofindItems[0];
      }

      this.estado = 'READY';
      this.mensaje = '';
      this.markReadyNow();

      if (data?.olt?.nombre) {
        this.selectedOltNombre = data.olt.nombre;
      }
    } catch (err: any) {
      const backendMsg = this.extractBackendMsg(err);
      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo listar autofind';
      await Swal.fire('Error', this.mensaje, 'error');
    } finally {
      this.loadingAutofind = false;
    }
  }

  seleccionarAutofind(it: OntAutofindAllItem): void {
    this.autofindSeleccionada = it;
  }

  get descripcionProvision(): string {
    if (!this.servicioSeleccionado) return '';

    const orden = String(this.servicioSeleccionado.ord_ins || '').trim();
    const nombre = String(this.servicioSeleccionado.nombre_completo || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/[^A-Z0-9_]/g, '');

    return `${orden}_${nombre}`.replace(/_+/g, '_');
  }

  get canAgregarOnt(): boolean {
    return !!(
      this.servicioSeleccionado &&
      this.cajaSeleccionada &&
      this.hasSelectedOlt &&
      this.autofindSeleccionada &&
      !this.isBusy
    );
  }

  async agregarOntDesdeFlujo(): Promise<void> {
    if (!this.canAgregarOnt || !this.autofindSeleccionada) {
      await Swal.fire(
        'Datos incompletos',
        'Debes seleccionar servicio, caja y ONT autofind.',
        'warning',
      );
      return;
    }

    const okReady = await this.ensureReady();
    if (!okReady) return;

    this.estado = 'INGRESANDO';
    this.mensaje = 'Ingresando ONT...';
    this.provisionResult = null;

    try {
      const snHex16 = this.toHex16(
        String(this.autofindSeleccionada.snHex || ''),
      );
      const desc = this.descripcionProvision;
      const trafficIn = Number(this.ingresoForm.value.trafficIn);
      const trafficOut = Number(this.ingresoForm.value.trafficOut);

      const data = await lastValueFrom(
        this.oltService.ontProvisionAutofind(
          Number(this.selectedOltId),
          snHex16,
          desc,
          trafficIn,
          trafficOut,
        ),
      );
      if (!data?.ok) throw { error: data };

      // guardar datos mínimos para el mensaje
      const okMsg = `SN: ${data.sn}\nF/S/P: ${data.fsp}\nONT-ID: ${data.ontId}`;
      const oltIdToClose = this.selectedOltId;

      // limpiar UI inmediatamente
      this.lastReadyAt = 0;
      this.estado = 'IDLE';
      this.mensaje = '';
      this.result = null;
      this.cooldownSec = 0;
      this.clearCooldown();

      this.oltForm.reset();
      this.ingresoForm.reset(
        { trafficIn: 98, trafficOut: 99 },
        { emitEvent: false },
      );

      this.busquedaCtrl.setValue('', { emitEvent: false });
      this.nombresFiltrados = [];
      this.showSugerencias = false;
      this.highlightedIndex = -1;
      this.busquedaCedula = '';

      this.loadingServicios = false;
      this.loadingAutofind = false;

      this.clienteSeleccionado = null;
      this.serviciosEncontrados = [];
      this.servicioSeleccionado = null;

      this.cajaSeleccionada = null;
      this.selectedOltId = null;
      this.selectedOltNombre = null;

      this.autofindItems = [];
      this.autofindSeleccionada = null;
      this.provisionResult = null;
      this.showMapaModal = false;

      this.tab = 'INGRESO';

      // mostrar éxito ya con la pantalla limpia
      await Swal.fire('ONT ingresada', okMsg, 'success');

      // cerrar sesión al final
      try {
        if (oltIdToClose) {
          await lastValueFrom(this.oltService.close(Number(oltIdToClose)));
        }
      } catch (err) {
        console.warn('No se pudo cerrar la sesión OLT:', err);
      }
    } catch (err: any) {
      const backendMsg = this.extractBackendMsg(err);
      this.estado = 'ERROR';
      this.mensaje = backendMsg || 'No se pudo ingresar la ONT';
      await Swal.fire('Error', this.mensaje, 'error');
    }
  }

  limpiarIngreso(): void {
    this.busquedaCtrl.setValue('', { emitEvent: false });
    this.nombresFiltrados = [];
    this.showSugerencias = false;
    this.highlightedIndex = -1;
    this.clearServicioRelacionado();
    this.ingresoForm.reset({ trafficIn: 98, trafficOut: 99 });
    this.mensaje = '';
    this.estado = 'IDLE';
  }

  limpiarConsultas(): void {
    this.oltForm.reset();
    this.result = null;
    this.mensaje = '';
    this.estado = this.sessionReady ? 'READY' : 'IDLE';
  }

  limpiarTodo(): void {
    this.limpiarConsultas();
    this.limpiarIngreso();
  }

  // =========================
  // UI helpers
  // =========================
  checkError(controlName: string, error: string): boolean {
    const c = this.oltForm.get(controlName);
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

  private startCooldownFromMessage(msg: string): void {
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

  private clearCooldown(): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = null;
    this.cooldownSec = 0;
  }

  async cargarOlts(): Promise<void> {
    this.loadingOlts = true;
    try {
      const res = await this.cajasService.getOlts();
      this.oltsDisponibles = (res?.data ?? [])
        .filter((o: any) => o.estado === 'ACTIVA')
        .map((o: any) => ({
          id: Number(o.id),
          olt_nombre: String(o.olt_nombre || ''),
          olt_ciudad: String(o.olt_ciudad || ''),
        }));
    } catch (error) {
      console.error('Error cargando OLTs:', error);
      this.oltsDisponibles = [];
    } finally {
      this.loadingOlts = false;
    }
  }

  onConsultaOltChange(rawValue: string | number | null): void {
    const oltId = Number(rawValue || 0);
    const found = this.oltsDisponibles.find((o) => o.id === oltId) || null;

    this.selectedOltId = found ? found.id : null;
    this.selectedOltNombre = found ? found.olt_nombre : null;

    this.result = null;
    this.mensaje = this.selectedOltId
      ? ''
      : 'Selecciona una OLT para consultar';
    this.estado = this.selectedOltId ? 'IDLE' : 'ERROR';
  }

  private async finalizarCicloIngreso(): Promise<void> {
    try {
      if (this.hasSelectedOlt) {
        await lastValueFrom(this.oltService.close(Number(this.selectedOltId)));
      }
    } catch (err) {
      console.warn('No se pudo cerrar la sesión OLT:', err);
    } finally {
      this.lastReadyAt = 0;
      this.estado = 'IDLE';
      this.mensaje = '';
      this.result = null;
      this.cooldownSec = 0;
      this.clearCooldown();

      this.oltForm.reset();
      this.ingresoForm.reset({ trafficIn: 98, trafficOut: 99 });

      this.busquedaCtrl.setValue('', { emitEvent: false });
      this.nombresFiltrados = [];
      this.showSugerencias = false;
      this.highlightedIndex = -1;
      this.busquedaCedula = '';

      this.clienteSeleccionado = null;
      this.serviciosEncontrados = [];
      this.servicioSeleccionado = null;

      this.cajaSeleccionada = null;
      this.selectedOltId = null;
      this.selectedOltNombre = null;

      this.autofindItems = [];
      this.autofindSeleccionada = null;
      this.loadingAutofind = false;

      this.provisionResult = null;
      this.showMapaModal = false;

      this.tab = 'INGRESO';
    }
  }
}
