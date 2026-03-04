import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CajasService } from '../../../../../services/negocio_latacunga/cajas.services';
import { ICajas } from '../../../../../interfaces/negocio/infraestructura/icajas.interface';

type TabKey = 'PON' | 'NAP' | 'SPLITTER';

function coordsValidator(ctrl: AbstractControl): ValidationErrors | null {
  const v = (ctrl.value ?? '').toString().trim();
  if (!v) return null;
  const parts = v.split(',').map((s: string) => s.trim());
  if (parts.length !== 2) return { coords: 'Formato inválido. Use lat,lng' };
  const lat = Number(parts[0]),
    lng = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng))
    return { coords: 'Coordenadas no numéricas' };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
    return { coords: 'Rango fuera de lat/lng' };
  return null;
}

function rutaValidator(ctrl: AbstractControl): ValidationErrors | null {
  const v = (ctrl.value ?? '').toString().trim();
  if (!v) return { ruta: 'Requerido' };
  if (!/^\d+(\/\d+)*$/.test(v))
    return { ruta: 'Formato inválido (ej: 5 o 7/2)' };
  return null;
}

@Component({
  selector: 'app-mapa-cajas-controls',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mapa-cajas-controls.component.html',
  styleUrls: ['./mapa-cajas-controls.component.css'],
})
export class MapaCajasControlsComponent implements OnInit, OnChanges {
  @Input() coords: string | null = null;
  @Output() created = new EventEmitter<ICajas>();
  @Output() requestPick = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private cajasService = inject(CajasService);

  tab: TabKey = 'PON';

  isSaving = false;
  serverMsg = '';

  // combos
  ciudades = ['LATACUNGA', 'SALCEDO'] as const;
  splits: Array<2 | 8 | 16> = [2, 8, 16];

  // fibra/hilo (como tu versión)
  simpleHilos = [1, 2];
  buffers = [1, 2, 3, 4];
  hilos = [1, 2, 3, 4, 5, 6];

  // data PONs / rutas
  pones: ICajas[] = [];
  rutasDisponibles: string[] = [];
  ponInfo: { capacidad: number; usados: number; disponibles: number } | null =
    null;

  // ===== forms =====
  formPon = this.fb.group({
    caja_ciudad: ['LATACUNGA', Validators.required],
    caja_segmento: ['', [Validators.required, Validators.maxLength(80)]],
    caja_root_split: [8 as 2 | 8 | 16, Validators.required],
    caja_estado: ['ACTIVO', Validators.required],

    fibra_tipo: ['DROP', Validators.required],
    hilo_desconocido: [false],
    simple_hilo: [null as number | null],
    buffer: [null as number | null],
    hilo_num: [null as number | null],
    caja_hilo: [{ value: '', disabled: true }],

    caja_coordenadas: ['', coordsValidator],
  });

  formNap = this.fb.group({
    caja_pon_id: [null as number | null, Validators.required],
    caja_pon_ruta: ['', rutaValidator],

    caja_ciudad: [{ value: 'LATACUNGA', disabled: true }, Validators.required],
    caja_segmento: [{ value: '', disabled: true }, Validators.required],

    caja_root_split: [16 as 2 | 8 | 16, Validators.required],
    caja_estado: ['ACTIVO', Validators.required],

    fibra_tipo: ['DROP', Validators.required],
    hilo_desconocido: [false],
    simple_hilo: [null as number | null],
    buffer: [null as number | null],
    hilo_num: [null as number | null],
    caja_hilo: [{ value: '', disabled: true }],

    caja_coordenadas: ['', coordsValidator],
  });

  formSplitter = this.fb.group({
    caja_id: [null as number | null, Validators.required], // por ahora solo PON
    path: ['', rutaValidator],
    factor: [2 as 2 | 8 | 16, Validators.required],
  });

  get fPon() {
    return this.formPon.controls;
  }
  get fNap() {
    return this.formNap.controls;
  }
  get fSpl() {
    return this.formSplitter.controls;
  }

  ngOnInit(): void {
    this.wireFiberRules(this.formPon);
    this.wireFiberRules(this.formNap);

    this.loadPones();

    // cuando selecciona PON en NAP, cargar rutas y setear ciudad/segmento por defecto
    this.formNap.get('caja_pon_id')!.valueChanges.subscribe((ponId) => {
      if (!ponId) {
        this.rutasDisponibles = [];
        this.ponInfo = null;
        return;
      }
      const pon = this.pones.find((p) => p.id === Number(ponId));
      this.formNap
        .get('caja_ciudad')!
        .setValue((pon?.caja_ciudad || 'LATACUNGA') as any, {
          emitEvent: false,
        });
      this.formNap
        .get('caja_segmento')!
        .setValue((pon?.caja_segmento || '') as any, { emitEvent: false });
      const ciudad = (pon?.caja_ciudad || 'LATACUNGA').toString();
      const seg = (pon?.caja_segmento || '').toString();
      this.formNap.patchValue(
        {
          caja_segmento: seg || this.formNap.get('caja_segmento')!.value || '',
        },
        { emitEvent: false },
      );
      this.formNap
        .get('caja_ciudad')!
        .setValue(ciudad as any, { emitEvent: false });

      this.refreshRutasDisponibles(Number(ponId));
      this.refreshDisponibilidad(Number(ponId));
    });

    // splitters tab: cuando elige PON, refresca rutas disponibles y disponibilidad
    this.formSplitter.get('caja_id')!.valueChanges.subscribe((id) => {
      if (!id) {
        this.ponInfo = null;
        this.rutasDisponibles = [];
        return;
      }
      this.refreshRutasDisponibles(Number(id));
      this.refreshDisponibilidad(Number(id));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['coords']) {
      const c = (this.coords ?? '').toString();
      if (!c) return;

      // solo aplica al tab actual
      if (this.tab === 'PON')
        this.formPon.patchValue({ caja_coordenadas: c }, { emitEvent: false });
      if (this.tab === 'NAP')
        this.formNap.patchValue({ caja_coordenadas: c }, { emitEvent: false });
    }
  }

  setTab(t: TabKey) {
    this.serverMsg = '';
    this.tab = t;
  }

  // ====== carga de PONs ======
  async loadPones() {
    try {
      this.pones = await this.cajasService.getCajas({
        tipo: 'PON',
        limit: 2000,
      });
    } catch (e) {
      console.error(e);
      this.pones = [];
    }
  }

  private async refreshRutasDisponibles(ponId: number) {
    try {
      const res = await this.cajasService.getRutasDisponibles(ponId);
      this.rutasDisponibles = res.data?.disponibles ?? [];

      // si la ruta actual no es válida, setea una por defecto
      const current = (this.formNap.get('caja_pon_ruta')!.value || '')
        .toString()
        .trim();
      if (this.tab === 'NAP') {
        if (!current || !this.rutasDisponibles.includes(current)) {
          this.formNap.patchValue(
            { caja_pon_ruta: this.rutasDisponibles[0] ?? '' },
            { emitEvent: false },
          );
        }
      }
      if (this.tab === 'SPLITTER') {
        const p = (this.formSplitter.get('path')!.value || '')
          .toString()
          .trim();
        if (!p || !this.rutasDisponibles.includes(p)) {
          this.formSplitter.patchValue(
            { path: this.rutasDisponibles[0] ?? '' },
            { emitEvent: false },
          );
        }
      }
    } catch (e) {
      console.error(e);
      this.rutasDisponibles = [];
    }
  }

  private async refreshDisponibilidad(id: number) {
    try {
      const res = await this.cajasService.getDisponibilidad(id);
      this.ponInfo = {
        capacidad: res.data.capacidad,
        usados: res.data.usados,
        disponibles: res.data.disponibles,
      };
    } catch (e) {
      console.error(e);
      this.ponInfo = null;
    }
  }

  // ====== fibra/hilo compartido ======
  private isFibraSimple(form: any): boolean {
    const t = (form.get('fibra_tipo')!.value || '').toString();
    return t === 'DROP' || t === 'FLAT';
  }

  private hiloDesconocido(form: any): boolean {
    return form.get('hilo_desconocido')!.value === true;
  }

  private wireFiberRules(form: any) {
    const syncRules = () => this.syncHiloRules(form);
    const syncPreview = () => this.syncHiloPreview(form);

    ['fibra_tipo', 'hilo_desconocido'].forEach((k) =>
      form.get(k)!.valueChanges.subscribe(syncRules),
    );
    [
      'fibra_tipo',
      'hilo_desconocido',
      'simple_hilo',
      'buffer',
      'hilo_num',
    ].forEach((k) => form.get(k)!.valueChanges.subscribe(syncPreview));

    // init
    this.syncHiloRules(form);
    this.syncHiloPreview(form);
  }

  private syncHiloRules(form: any) {
    const tipo = (form.get('fibra_tipo')!.value || 'DROP').toString();
    const unknown = this.hiloDesconocido(form);

    const simple = form.get('simple_hilo')!;
    const buf = form.get('buffer')!;
    const hilo = form.get('hilo_num')!;

    if (unknown) {
      simple.clearValidators();
      buf.clearValidators();
      hilo.clearValidators();
      simple.setValue(null, { emitEvent: false });
      buf.setValue(null, { emitEvent: false });
      hilo.setValue(null, { emitEvent: false });
    } else {
      if (tipo === 'DROP' || tipo === 'FLAT') {
        simple.setValidators([Validators.required]);
        buf.clearValidators();
        hilo.clearValidators();
        buf.setValue(null, { emitEvent: false });
        hilo.setValue(null, { emitEvent: false });
      } else {
        simple.clearValidators();
        simple.setValue(null, { emitEvent: false });
        buf.setValidators([Validators.required]);
        hilo.setValidators([Validators.required]);
      }
    }

    simple.updateValueAndValidity({ emitEvent: false });
    buf.updateValueAndValidity({ emitEvent: false });
    hilo.updateValueAndValidity({ emitEvent: false });
  }

  private syncHiloPreview(form: any) {
    const tipo = (form.get('fibra_tipo')!.value || 'DROP').toString();
    const unknown = this.hiloDesconocido(form);
    const sh = form.get('simple_hilo')!.value;
    const buf = form.get('buffer')!.value;
    const hn = form.get('hilo_num')!.value;

    let preview = '';
    if (unknown) preview = `${tipo} DESCONOCIDO`;
    else if (tipo === 'DROP' || tipo === 'FLAT') {
      if (sh !== null) preview = `${tipo} ${sh}`;
    } else {
      if (buf !== null && hn !== null) preview = `${tipo} ${buf}/${hn}`;
    }
    form.get('caja_hilo')!.setValue(preview, { emitEvent: false });
  }

  // ===== SUBMITS =====
  async submitPon() {
    this.serverMsg = '';
    if (this.formPon.invalid) {
      this.formPon.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    try {
      const payload: Partial<ICajas> = {
        caja_ciudad: this.formPon.get('caja_ciudad')!.value as any,
        caja_segmento: (this.formPon.get('caja_segmento')!.value || '')
          .toString()
          .trim(),
        caja_root_split: this.formPon.get('caja_root_split')!.value as any,
        caja_estado: this.formPon.get('caja_estado')!.value as any,
        caja_hilo: (this.formPon.get('caja_hilo')!.value || '').toString(),
        caja_coordenadas:
          (this.formPon.get('caja_coordenadas')!.value || '').toString() ||
          null,
      };

      const res = await this.cajasService.createPon(payload);
      const created: ICajas = {
        id: res.data.id,
        caja_tipo: 'PON',
        caja_nombre: res.data.caja_nombre,
        caja_estado: payload.caja_estado as any,
        caja_ciudad: payload.caja_ciudad,
        caja_hilo: payload.caja_hilo,
        caja_coordenadas: payload.caja_coordenadas,
        caja_root_split: payload.caja_root_split as any,
        caja_segmento: payload.caja_segmento,
      };

      this.created.emit(created);
      this.serverMsg = '✅ PON creada.';
      await this.loadPones(); // refresca combos
      this.formPon.patchValue({ caja_segmento: '', caja_coordenadas: '' });
      this.syncHiloRules(this.formPon);
      this.syncHiloPreview(this.formPon);
    } catch (e: any) {
      console.error(e);
      this.serverMsg = `❌ Error creando PON: ${e?.error?.message || 'revisa el backend'}`;
    } finally {
      this.isSaving = false;
    }
  }

  async submitNap() {
    this.serverMsg = '';
    if (this.formNap.invalid) {
      this.formNap.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    try {
      const ponId = Number(this.formNap.get('caja_pon_id')!.value);
      const payload: Partial<ICajas> = {
        caja_pon_id: ponId,
        caja_pon_ruta: this.formNap
          .get('caja_pon_ruta')!
          .value!.toString()
          .trim(),
        caja_root_split: this.formNap.get('caja_root_split')!.value as any,
        caja_estado: this.formNap.get('caja_estado')!.value as any,
        caja_hilo: (this.formNap.get('caja_hilo')!.value || '').toString(),
        caja_coordenadas:
          (this.formNap.get('caja_coordenadas')!.value || '').toString() ||
          null,
      };

      const res = await this.cajasService.createNap(payload);
      const created: ICajas = {
        id: res.data.id,
        caja_tipo: 'NAP',
        caja_nombre: res.data.caja_nombre,
        caja_estado: payload.caja_estado as any,
        caja_ciudad: payload.caja_ciudad,
        caja_hilo: payload.caja_hilo,
        caja_coordenadas: payload.caja_coordenadas,
        caja_root_split: payload.caja_root_split as any,
        caja_segmento: payload.caja_segmento,
        caja_pon_id: ponId,
        caja_pon_ruta: payload.caja_pon_ruta!,
      };

      this.created.emit(created);
      this.serverMsg = '✅ NAP creada.';
      // refresca rutas y disponibilidad
      await this.refreshRutasDisponibles(ponId);
      await this.refreshDisponibilidad(ponId);
      // limpia coords
      this.formNap.patchValue({ caja_coordenadas: '' });
      this.syncHiloRules(this.formNap);
      this.syncHiloPreview(this.formNap);
    } catch (e: any) {
      console.error(e);
      this.serverMsg = `❌ Error creando NAP: ${e?.error?.message || 'revisa el backend'}`;
    } finally {
      this.isSaving = false;
    }
  }

  async submitSplitter() {
    this.serverMsg = '';
    if (this.formSplitter.invalid) {
      this.formSplitter.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    try {
      const cajaId = Number(this.formSplitter.get('caja_id')!.value);
      const path = (this.formSplitter.get('path')!.value || '')
        .toString()
        .trim();
      const factor = this.formSplitter.get('factor')!.value as any;

      await this.cajasService.addSplitter(cajaId, { path, factor });
      this.serverMsg = `✅ Splitter R${factor} agregado en ${path}`;

      await this.refreshRutasDisponibles(cajaId);
      await this.refreshDisponibilidad(cajaId);
    } catch (e: any) {
      console.error(e);
      this.serverMsg = `❌ Error agregando splitter: ${e?.error?.message || 'revisa el backend'}`;
    } finally {
      this.isSaving = false;
    }
  }

  // helpers UI
  isFibraSimplePon() {
    return this.isFibraSimple(this.formPon);
  }
  isFibraSimpleNap() {
    return this.isFibraSimple(this.formNap);
  }
  hiloDesconocidoPon() {
    return this.hiloDesconocido(this.formPon);
  }
  hiloDesconocidoNap() {
    return this.hiloDesconocido(this.formNap);
  }
}
