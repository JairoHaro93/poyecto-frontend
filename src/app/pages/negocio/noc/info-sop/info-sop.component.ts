import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Modal } from 'bootstrap';

import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';

import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';
import { IVisConImagenes } from '../../../../interfaces/negocio/imagenes/imagenes.interface';
import { ImageItem } from '../../../../interfaces/negocio/images/images';

import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { ImagesService } from '../../../../services/negocio_latacunga/images.service';
import { VisService } from '../../../../services/negocio_latacunga/vis.service';
import { SoketService } from '../../../../services/socket_io/soket.service';
import {
  OltService,
  OntInfoBySnResponse,
} from '../../../../services/negocio_latacunga/olt.services';
import { lastValueFrom } from 'rxjs';

type TabKey = 'instalacion' | 'soportes' | 'visitas';

type EstadoOnt = 'IDLE' | 'CONECTANDO' | 'OK' | 'ERROR' | 'COOLDOWN';

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
  selector: 'app-info-sop',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ReactiveFormsModule],
  templateUrl: './info-sop.component.html',
  styleUrls: ['./info-sop.component.css'],
})
export class InfoSopComponent implements OnInit, OnDestroy {
  // ====== Tabs ======
  activeTab: TabKey = 'instalacion';
  setTab(tab: TabKey) {
    this.activeTab = tab;
  }

  // ====== Inputs / estado ======
  @Input() ordIns!: number | string;

  soporte: Isoportes | null = null;
  soportesResueltos: Isoportes[] = [];
  loadingSoportes = false;
  errorSoportes: string | null = null;

  isReady = false;
  imagenSeleccionada: string | null = null;

  // Ruta
  id_sop: number | null = null;
  ord_Ins: string = '';

  // Mostrar/Ocultar secciones
  showSoportes = false;
  showVisitas = false;
  toggleSoportesList() {
    this.showSoportes = !this.showSoportes;
  }
  toggleVisitasList() {
    this.showVisitas = !this.showVisitas;
  }

  // Datos/servicios
  datosUsuario: any;

  clientelista: Iclientes[] = [];
  clienteSeleccionado: Iclientes | null = null;
  servicioSeleccionado: any = null;

  solucionSeleccionada: string = 'REVISION';
  detalleSolucion: string = '';

  imagenesInstalacion: Record<string, { ruta: string; url: string }> = {};
  imagenesVisitas: IVisConImagenes[] = [];

  // ====== Inyección ======
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  private authService = inject(AutenticacionService);
  private soportesService = inject(SoportesService);
  private agendaService = inject(AgendaService);
  private imagesService = inject(ImagesService);
  private visService = inject(VisService);
  private clienteService = inject(ClientesService);
  private socketService = inject(SoketService);

  private paramsSub: any;

  // ============================
  // ONT (solo si onu != null)
  // ============================
  showOntPanel = false;

  ontEstado: EstadoOnt = 'IDLE';
  ontMensaje = '';
  ontResult: OntInfoBySnResponse | null = null;

  cooldownSecOnt = 0;
  private cooldownTimerOnt: any = null;

  private fb = inject(FormBuilder);
  private oltService = inject(OltService);

  ontForm: FormGroup = this.fb.group({
    sn: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, snOntValidator],
    }),
  });

  // ✅ lee onu desde tu respuesta (ajusta si tu onu está en otro lugar)
  get onuSn(): string | null {
    const onu =
      this.servicioSeleccionado?.servicios?.[0]?.onu ??
      this.servicioSeleccionado?.onu ??
      null;

    const v = String(onu ?? '').trim();
    return v ? v : null;
  }

  toggleOntPanel(): void {
    if (!this.onuSn) return;
    this.showOntPanel = !this.showOntPanel;

    // al abrir, precarga onu al input si está vacío o distinto
    if (this.showOntPanel) {
      const cur = String(this.ontForm.value.sn ?? '').trim();
      if (!cur || cur !== this.onuSn) {
        this.ontForm.patchValue({ sn: this.onuSn }, { emitEvent: false });
        this.normalizeOntInput('sn');
      }
    }
  }

  // normaliza input ONT
  normalizeOntInput(field: string): void {
    const c = this.ontForm.get(field);
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
    if (!this.onuSn) return;
    if (this.ontEstado === 'CONECTANDO' || this.ontEstado === 'COOLDOWN')
      return;

    if (this.ontForm.invalid) {
      this.ontForm.markAllAsTouched();
      return;
    }

    this.ontEstado = 'CONECTANDO';
    this.ontMensaje = 'Consultando ONT...';
    this.ontResult = null;

    try {
      const snInput = String(this.ontForm.value.sn || '');
      const snHex16 = this.toHex16(snInput);

      const data = await lastValueFrom(this.oltService.ontInfoBySn(snHex16));
      if (!data?.ok) throw { error: data };

      this.ontEstado = 'OK';
      this.ontMensaje = 'OK';
      this.ontResult = data;

      await Swal.fire('Listo', `ONT consultada: ${data.sn}`, 'success');
    } catch (err: any) {
      const status = err?.status;
      const backendMsg =
        err?.error?.error?.message ||
        err?.error?.message ||
        err?.error?.error ||
        err?.message;

      if (status === 429) {
        this.ontEstado = 'COOLDOWN';
        this.ontMensaje = backendMsg || 'Espera antes de reintentar';
        this.ontResult = null;
        this.startCooldownFromMessageOnt(this.ontMensaje);
        await Swal.fire('Espera', this.ontMensaje, 'warning');
        return;
      }

      this.ontEstado = 'ERROR';
      this.ontMensaje = backendMsg || 'No se pudo consultar la ONT';
      this.ontResult = null;
      await Swal.fire('Error', this.ontMensaje, 'error');
    }
  }

  checkOntError(controlName: string, error: string): boolean {
    const c = this.ontForm.get(controlName);
    return !!(c?.touched && c.hasError(error));
  }

  get ontBadgeClass(): string {
    switch (this.ontEstado) {
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

  get ontEstadoTexto(): string {
    switch (this.ontEstado) {
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

  private startCooldownFromMessageOnt(msg: string) {
    this.clearCooldownOnt();
    const m = /espera\s+(\d+)s/i.exec(msg);
    this.cooldownSecOnt = m ? Number(m[1]) : 30;

    this.cooldownTimerOnt = setInterval(() => {
      this.cooldownSecOnt -= 1;
      if (this.cooldownSecOnt <= 0) {
        this.clearCooldownOnt();
        this.ontEstado = 'IDLE';
        this.ontMensaje = '';
      } else {
        this.ontMensaje = `Espera ${this.cooldownSecOnt}s antes de reintentar`;
      }
    }, 1000);
  }

  private clearCooldownOnt() {
    if (this.cooldownTimerOnt) clearInterval(this.cooldownTimerOnt);
    this.cooldownTimerOnt = null;
    this.cooldownSecOnt = 0;
  }

  async ngOnInit(): Promise<void> {
    this.datosUsuario = await this.authService.getUsuarioAutenticado();

    // ✅ intenta conectar (si ya está conectado por sidebar, no pasa nada)
    void this.ensureSocket();

    // Si ya viene ordIns por @Input, carga listado
    if (
      this.ordIns !== undefined &&
      this.ordIns !== null &&
      `${this.ordIns}`.trim() !== ''
    ) {
      await this.cargarSoportes();
    }

    // Manejo por ruta (id_sop / ord_ins)
    this.paramsSub = this.activatedRoute.params.subscribe(
      async (params: any) => {
        this.isReady = false;

        this.id_sop = params['id_sop'] ? Number(params['id_sop']) : null;
        this.ord_Ins = String(params['ord_ins'] ?? '').trim();

        if (!this.id_sop) {
          console.error("Error: 'id_sop' no válido");
          this.isReady = true;
          return;
        }

        try {
          await this.cargarSoporte(this.id_sop, this.ord_Ins);

          // Si no vino @Input, usa la de ruta para el listado
          if (
            this.ordIns === undefined ||
            this.ordIns === null ||
            `${this.ordIns}`.trim() === ''
          ) {
            this.ordIns = this.ord_Ins;
            await this.cargarSoportes();
          }

          this.cargarImagenesInstalacion(this.ord_Ins);
          await this.cargarImagenesVisitas(this.ord_Ins);
        } catch (e) {
          console.error('❌ Error inicial InfoSop:', e);
        } finally {
          this.isReady = true;
        }
      },
    );
  }

  ngOnDestroy(): void {
    if (this.paramsSub && typeof this.paramsSub.unsubscribe === 'function') {
      this.paramsSub.unsubscribe();
      this.clearCooldownOnt();
    }
  }

  // ============================
  // sockets helpers
  // ============================
  private async ensureSocket(): Promise<void> {
    try {
      await this.socketService.connectSocket();
    } catch {
      // silencio
    }
  }

  private emitSoporteActualizado(extra?: any): void {
    // Backend: "soporteActualizado" -> server emite "soporteActualizadoNOC"
    this.socketService.emit('soporteActualizado', {
      id_sop: this.id_sop,
      ord_ins: this.ord_Ins,
      estado: this.solucionSeleccionada,
      ...extra,
    });
  }

  private emitTrabajoPreagendado(): void {
    // Backend: "trabajoPreagendado" -> server emite "trabajoPreagendadoNOC"
    this.socketService.emit('trabajoPreagendado');
  }

  // ============================
  // Listado de soportes resueltos
  // ============================
  async cargarSoportes(): Promise<void> {
    this.loadingSoportes = true;
    this.errorSoportes = null;

    try {
      const ord =
        typeof this.ordIns === 'string' ? Number(this.ordIns) : this.ordIns;

      if (!Number.isFinite(ord as number)) {
        this.soportesResueltos = [];
        this.errorSoportes = 'ord_ins inválido para cargar soportes.';
      }

      // si hay ONU, precargar en el form
      if (this.onuSn) {
        this.ontForm.patchValue({ sn: this.onuSn }, { emitEvent: false });
        this.normalizeOntInput('sn');
      } else {
        const data = await this.soportesService.getAllResueltosSopByOrdIns(
          ord as number,
        );
        this.soportesResueltos = Array.isArray(data) ? data : [];
      }
    } catch {
      this.errorSoportes = 'No se pudieron cargar los soportes resueltos.';
    } finally {
      this.loadingSoportes = false;
    }
  }

  recargar(): void {
    void this.cargarSoportes();
  }

  // ============================
  // Carga detalle del soporte actual
  // ============================
  async cargarSoporte(id: number, ord_ins: string | number): Promise<void> {
    try {
      this.datosUsuario = await this.authService.getUsuarioAutenticado();

      this.soporte = await this.soportesService.getSopById(id);
      this.solucionSeleccionada = this.soporte?.reg_sop_estado || 'REVISION';
      this.detalleSolucion = this.soporte?.reg_sop_sol_det || '';

      const ordNum = Number(ord_ins);
      if (Number.isFinite(ordNum)) {
        this.servicioSeleccionado =
          await this.clienteService.getInfoServicioByOrdId(ordNum);
        console.log(this.servicioSeleccionado);
      } else {
        console.warn('[InfoSop] ord_ins no numérico:', ord_ins);
        this.servicioSeleccionado = null;
      }
    } catch (error) {
      console.error('❌ Error al cargar soporte:', error);
    }
  }

  // ============================
  // Imágenes instalación
  // ============================
  private cargarImagenesInstalacion(ord_Ins: string): void {
    this.imagesService.list('instalaciones', ord_Ins).subscribe({
      next: (items) => {
        this.imagenesInstalacion = this.adaptInstToLegacyMap(items);
      },
      error: (err) => {
        console.error('❌ Error cargando imágenes (instalación):', err);
        this.imagenesInstalacion = {};
      },
    });
  }

  // ============================
  // Imágenes visitas
  // ============================
  private async cargarImagenesVisitas(ord_Ins: string): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!ord_Ins) {
        this.imagenesVisitas = [];
        return resolve();
      }

      console.debug(
        '[VIS][InfoSop] GET:',
        `${environment.API_URL}/images/visitas/by-ord/${ord_Ins}`,
      );

      this.imagesService.listVisitasByOrdIns(ord_Ins).subscribe({
        next: (visitas) => {
          const arr = Array.isArray(visitas)
            ? visitas
            : visitas
              ? [visitas]
              : [];
          this.imagenesVisitas = (arr as any[]).map((v) => ({
            ...v,
            imagenes: this._adaptVisitaImgsToLegacyMap(v?.imagenes),
          }));
          resolve();
        },
        error: (err) => {
          console.error('❌ Error cargando imágenes de visitas:', err);
          this.imagenesVisitas = [];
          resolve();
        },
      });
    });
  }

  // Convierte ImageItem[] => { [clave]: { url, ruta } }
  private adaptInstToLegacyMap(
    items: ImageItem[],
  ): Record<string, { url: string; ruta: string }> {
    const map: Record<string, { url: string; ruta: string }> = {};
    for (const it of items ?? []) {
      const base = (it.tag || 'otros').trim();
      const key =
        typeof it.position === 'number' && it.position > 0
          ? `${base}_${it.position}`
          : base;

      const url = (it as any).url || '';
      if (!url) continue;

      map[key] = { url, ruta: url };
    }
    return map;
  }

  private _adaptVisitaImgsToLegacyMap(
    imgs: Record<string, any> | ImageItem[] | undefined,
  ): Record<string, { url: string; ruta: string }> {
    const out: Record<string, { url: string; ruta: string }> = {};

    // si backend ya manda map {img_1:{url},...}
    if (imgs && !Array.isArray(imgs)) {
      for (const [k, v] of Object.entries(imgs)) {
        const url = (v as any)?.url || (v as any)?.ruta || '';
        if (!url) continue;
        out[k] = { url, ruta: url };
      }
      return out;
    }

    // si manda ImageItem[]
    const arr = Array.isArray(imgs) ? (imgs as ImageItem[]) : [];
    for (const it of arr) {
      const tag = (it.tag || 'img').trim();
      const pos = typeof it.position === 'number' ? it.position : 0;
      const key =
        tag === 'img' && pos > 0
          ? `img_${pos}`
          : pos > 0
            ? `${tag}_${pos}`
            : tag;

      const url = (it as any).url || '';
      if (!url) continue;
      out[key] = { url, ruta: url };
    }

    return out;
  }

  // ============================
  // Utilitarios UI
  // ============================
  copyIp(ip: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = ip;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Error al copiar IP: ', err);
    }
    document.body.removeChild(textarea);
  }

  abrirImagenModal(url: string) {
    this.imagenSeleccionada = url;
    const modal = new Modal(document.getElementById('modalImagenAmpliada')!);
    modal.show();
  }

  asignarSolucion(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.solucionSeleccionada = inputElement.value;
  }

  // ============================
  // Guardar solución + sockets
  // ============================
  async guardarSolucion() {
    if (!this.solucionSeleccionada) {
      Swal.fire({
        title: 'Advertencia',
        text: 'Debes seleccionar un estado de solución.',
        icon: 'warning',
      });
      return;
    }

    if (!this.detalleSolucion || !this.detalleSolucion.trim()) {
      Swal.fire({
        title: 'Advertencia',
        text: 'La descripción de la solución no puede estar vacía.',
        icon: 'warning',
      });
      return;
    }

    const body = {
      reg_sop_estado: this.solucionSeleccionada,
      reg_sop_sol_det: this.detalleSolucion.trim(),
      reg_sop_noc_id_acepta: this.datosUsuario?.id,
    };

    // Asegura socket antes de emitir (por si entraste directo por URL)
    void this.ensureSocket();

    // ========= RESUELTO =========
    if (this.solucionSeleccionada === 'RESUELTO') {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿El soporte se ha resuelto satisfactoriamente?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, he resuelto el soporte',
        cancelButtonText: 'Cancelar',
      });

      if (!result.isConfirmed) return;

      try {
        await this.soportesService.actualizarEstadoSop(
          String(this.id_sop),
          body,
        );

        // ✅ socket: soporte actualizado
        this.emitSoporteActualizado({ motivo: 'RESUELTO' });

        // opcional: refrescar lista
        await this.cargarSoportes();

        this.router.navigateByUrl('/home/noc/soporte-tecnico');
      } catch ({ error }: any) {
        console.error(error);
        Swal.fire({
          title: 'Ocurrió un error al cerrar el soporte.',
          text: error?.message,
          icon: 'error',
        });
      }
      return;
    }

    // ========= LOS / VISITA =========
    if (
      this.solucionSeleccionada === 'LOS' ||
      this.solucionSeleccionada === 'VISITA'
    ) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿AGREGAR EL SOPORTE A LA AGENDA?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, debe agregarse a la agenda',
        cancelButtonText: 'Cancelar',
      });

      if (!result.isConfirmed) return;

      try {
        // 1) Actualiza soporte
        await this.soportesService.actualizarEstadoSop(
          String(this.id_sop),
          body,
        );

        // ✅ socket: soporte actualizado
        this.emitSoporteActualizado({
          motivo: 'AGENDAR',
          tipo: this.solucionSeleccionada,
        });

        // 2) Crea agenda
        const ageTipo =
          this.solucionSeleccionada === 'VISITA' ? 'VISITA' : 'LOS';
        const coords =
          this.servicioSeleccionado?.servicios?.[0]?.coordenadas ?? null;

        const bodyAge: any = {
          ord_ins: this.ord_Ins,
          age_id_sop: this.id_sop,
          age_diagnostico: this.detalleSolucion.trim(),
          age_coordenadas: coords,
          age_telefono: this.soporte?.reg_sop_tel,
          age_tipo: ageTipo,
        };

        await this.agendaService.postSopAgenda(bodyAge);

        // ✅ socket: nuevo trabajo en preagenda
        this.emitTrabajoPreagendado();

        // opcional: refrescar lista
        await this.cargarSoportes();

        this.router.navigateByUrl('/home/noc/soporte-tecnico');
      } catch ({ error }: any) {
        console.error(error);
        Swal.fire({ title: 'Error!', text: error?.message, icon: 'error' });
      }
      return;
    }

    // ========= Otros estados =========
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿GUARDAR LA SOLUCIÓN?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await this.soportesService.actualizarEstadoSop(String(this.id_sop), body);

      // ✅ socket: soporte actualizado
      this.emitSoporteActualizado({ motivo: 'CAMBIO_ESTADO' });

      // opcional: refrescar lista
      await this.cargarSoportes();

      this.router.navigateByUrl('/home/noc/soporte-tecnico');
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error!',
        text: 'Ocurrió un error al actualizar el soporte.',
        icon: 'error',
      });
    }
  }

  // ============================
  // Badge visitas
  // ============================
  getVisitaBadgeClass(tipo: string | null | undefined): string {
    const norm = (tipo ?? '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    switch (norm) {
      case 'visita':
        return 'bg-visita';
      case 'los':
        return 'bg-los';
      case 'retiro':
        return 'bg-retiro';
      case 'traslado ext':
        return 'bg-traslado-ext';
      case 'migracion':
        return 'bg-migracion';
      default:
        return 'bg-secondary text-white';
    }
  }

  async consultarOntConOnu(): Promise<void> {
    if (!this.onuSn) return;

    // ✅ mostrar área de resultados “dentro”
    this.showOntPanel = true;

    // ✅ precargar el SN desde onu
    this.ontForm.patchValue({ sn: this.onuSn }, { emitEvent: false });
    this.normalizeOntInput('sn');

    // ✅ ejecutar consulta
    await this.consultarOnt();
  }
}
