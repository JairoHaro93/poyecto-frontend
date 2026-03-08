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
import {
  CajasService,
  IOlt,
} from '../../../../../services/negocio_latacunga/cajas.services';
import { ICajas } from '../../../../../interfaces/negocio/infraestructura/icajas.interface';

type TabKey = 'PON' | 'NAP';

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

  // OLTs
  olts: IOlt[] = [];
  oltCiudad = '';

  // combos
  splits: Array<2 | 8 | 16> = [2, 8, 16];

  // fibra/hilo
  simpleHilos = [1, 2];
  buffers = [1, 2, 3, 4];
  hilos = [1, 2, 3, 4, 5, 6];

  // previews
  ponNombrePreview = '—';
  napNombrePreview = '—';

  // data PONs / rutas
  pones: ICajas[] = [];
  rutasDisponibles: string[] = [];
  ponInfo: { capacidad: number; usados: number; disponibles: number } | null =
    null;

  // ===== forms =====
  formPon = this.fb.group({
    caja_segmento: ['', [Validators.required, Validators.maxLength(80)]],

    caja_root_split: [8 as 2 | 8 | 16, Validators.required],
    caja_estado: ['ACTIVO', Validators.required],

    olt_id: [null as number | null, Validators.required],
    olt_slot: [
      1 as number | null,
      [Validators.required, Validators.min(0), Validators.max(31)],
    ],
    olt_pon: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(31)],
    ],

    split_mode: ['' as '' | 'S2/1' | 'S2/2'],

    fibra_tipo: ['DROP', Validators.required],
    hilo_desconocido: [false],
    simple_hilo: [null as number | null],
    buffer: [null as number | null],
    hilo_num: [null as number | null],
    caja_hilo: [{ value: '', disabled: true }],

    caja_coordenadas: ['', [Validators.required, coordsValidator]],
  });

  formNap = this.fb.group({
    caja_pon_id: [null as number | null, Validators.required],
    caja_pon_ruta: ['', rutaValidator],

    caja_ciudad: [{ value: '', disabled: true }, Validators.required],
    caja_segmento: [{ value: '', disabled: true }, Validators.required],

    caja_root_split: [16 as 2 | 8 | 16, Validators.required],
    caja_estado: ['ACTIVO', Validators.required],

    fibra_tipo: ['DROP', Validators.required],
    hilo_desconocido: [false],
    simple_hilo: [null as number | null],
    buffer: [null as number | null],
    hilo_num: [null as number | null],
    caja_hilo: [{ value: '', disabled: true }],

    caja_coordenadas: ['', [Validators.required, coordsValidator]],

    // Expandir (opcional) — usa splitter del PON
    expand_path: [''],
    expand_factor: [2 as 2 | 8 | 16, Validators.required],
  });

  get fPon() {
    return this.formPon.controls;
  }
  get fNap() {
    return this.formNap.controls;
  }

  async ngOnInit(): Promise<void> {
    this.wireFiberRules(this.formPon);
    this.wireFiberRules(this.formNap);

    // NAP preview listeners
    this.formNap.get('caja_pon_ruta')!.valueChanges.subscribe(() => {
      this.updateNapNombrePreview();
    });
    this.formNap.get('caja_root_split')!.valueChanges.subscribe(() => {
      this.updateNapNombrePreview();
    });

    // 1) OLTs + listeners PON
    try {
      const oltsRes = await this.cajasService.getOlts();
      this.olts = (oltsRes.data ?? []).filter((o) => o.estado === 'ACTIVA');

      this.formPon
        .get('olt_id')
        ?.setValue(this.olts[0]?.id ?? null, { emitEvent: false });

      this.syncOltCiudad();
      this.syncSegmentFromOlt();
      this.updatePonNombrePreview();

      ['olt_id', 'olt_slot', 'olt_pon'].forEach((k) => {
        this.formPon.get(k)!.valueChanges.subscribe(() => {
          this.syncOltCiudad();
          this.syncSegmentFromOlt();
        });
      });

      this.formPon.get('split_mode')!.valueChanges.subscribe(() => {
        this.updatePonNombrePreview();
      });

      this.formPon.get('caja_root_split')!.valueChanges.subscribe(() => {
        this.updatePonNombrePreview();
      });
    } catch (e) {
      console.error(e);
      this.olts = [];
      this.formPon.get('olt_id')?.setValue(null, { emitEvent: false });
      this.serverMsg = '⚠️ No se pudieron cargar las OLTs.';
    }

    // 2) PONs
    await this.loadPones();

    // 3) NAP hereda de PON seleccionado
    this.formNap.get('caja_pon_id')!.valueChanges.subscribe((ponId) => {
      if (!ponId) {
        this.rutasDisponibles = [];
        this.ponInfo = null;
        this.formNap.patchValue({ caja_pon_ruta: '' }, { emitEvent: false });
        this.updateNapNombrePreview();
        return;
      }

      const pon = this.pones.find((p) => p.id === Number(ponId));
      const ciudad = (pon?.caja_ciudad || '').toString();
      const seg = (pon?.caja_segmento || '').toString();

      this.formNap
        .get('caja_ciudad')!
        .setValue(ciudad as any, { emitEvent: false });
      this.formNap
        .get('caja_segmento')!
        .setValue(seg as any, { emitEvent: false });

      this.refreshRutasDisponibles(Number(ponId));
      this.refreshDisponibilidad(Number(ponId));
      this.updateNapNombrePreview();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['coords']) {
      const c = (this.coords ?? '').toString();
      if (!c) return;

      if (this.tab === 'PON') {
        this.formPon.patchValue({ caja_coordenadas: c }, { emitEvent: false });
      }
      if (this.tab === 'NAP') {
        this.formNap.patchValue({ caja_coordenadas: c }, { emitEvent: false });
      }
    }
  }

  setTab(t: TabKey) {
    this.serverMsg = '';
    this.tab = t;
  }

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

      const current = (this.formNap.get('caja_pon_ruta')!.value || '')
        .toString()
        .trim();
      if (!current || !this.rutasDisponibles.includes(current)) {
        this.formNap.patchValue(
          { caja_pon_ruta: this.rutasDisponibles[0] ?? '' },
          { emitEvent: false },
        );
      }

      // ✅ importante (porque patchValue va con emitEvent:false)
      this.updateNapNombrePreview();
    } catch (e) {
      console.error(e);
      this.rutasDisponibles = [];
      this.updateNapNombrePreview();
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

  // ====== Expandir (NAP) ======
  async expandNapRuta() {
    this.serverMsg = '';

    const ponId = Number(this.formNap.get('caja_pon_id')!.value);
    const path = (this.formNap.get('expand_path')!.value || '')
      .toString()
      .trim();
    const factor = this.formNap.get('expand_factor')!.value as 2 | 8 | 16;

    if (!ponId) return void (this.serverMsg = '⚠️ Selecciona un PON primero.');
    if (!path)
      return void (this.serverMsg = '⚠️ Selecciona la hoja a expandir.');

    this.isSaving = true;
    try {
      await this.cajasService.addSplitter(ponId, { path, factor });

      await this.refreshRutasDisponibles(ponId);
      await this.refreshDisponibilidad(ponId);

      const desired = `${path}/1`;
      const nextRuta = this.rutasDisponibles.includes(desired)
        ? desired
        : (this.rutasDisponibles[0] ?? '');

      this.formNap.patchValue(
        { caja_pon_ruta: nextRuta, expand_path: '' },
        { emitEvent: false },
      );

      // ✅ como emitEvent:false, actualiza preview manual
      this.updateNapNombrePreview();

      this.serverMsg = `✅ Expandido ${path} con R${factor}`;
    } catch (e: any) {
      console.error(e);
      this.serverMsg = `❌ Error expandiendo: ${e?.error?.message || 'revisa el backend'}`;
    } finally {
      this.isSaving = false;
    }
  }

  // ====== fibra/hilo ======
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

  // ====== PON: SEG + preview ======
  private syncOltCiudad() {
    const oid = this.formPon.get('olt_id')!.value;
    const olt = this.olts.find((o) => o.id === Number(oid));
    this.oltCiudad = (olt?.olt_ciudad || '').toString().toUpperCase().trim();
  }

  private syncSegmentFromOlt() {
    const oid = this.formPon.get('olt_id')!.value;
    const slot = this.formPon.get('olt_slot')!.value;
    const pon = this.formPon.get('olt_pon')!.value;

    if (!oid || slot == null || pon == null) {
      this.formPon.get('caja_segmento')!.setValue('', { emitEvent: false });
      this.updatePonNombrePreview();
      return;
    }

    const base = `${Number(slot)}/${Number(pon)}`; // sin frame
    this.formPon.get('caja_segmento')!.setValue(base, { emitEvent: false });

    this.updatePonNombrePreview();
  }

  private cityAbbr(ciudad: string) {
    const c = (ciudad || '').toUpperCase().trim();
    if (c === 'LATACUNGA') return 'LAT';
    if (c === 'SALCEDO') return 'SAL';
    return c ? c.slice(0, 3) : 'XXX';
  }

  private updatePonNombrePreview(): void {
    const baseSeg = (this.formPon.get('caja_segmento')!.value || '')
      .toString()
      .trim();
    const r = this.formPon.get('caja_root_split')!.value;
    const mode = (this.formPon.get('split_mode')!.value || '')
      .toString()
      .trim();
    const abbr = this.cityAbbr(this.oltCiudad);

    if (!baseSeg || !r) {
      this.ponNombrePreview = '—';
      return;
    }

    const seg =
      mode === 'S2/1' || mode === 'S2/2' ? `${baseSeg}/${mode}` : baseSeg;

    this.ponNombrePreview = `${abbr}-PON-${seg}-R${r}`;
  }

  private updateNapNombrePreview(): void {
    const ciudad = (this.formNap.get('caja_ciudad')!.value || '')
      .toString()
      .trim();
    const seg = (this.formNap.get('caja_segmento')!.value || '')
      .toString()
      .trim();
    const ruta = (this.formNap.get('caja_pon_ruta')!.value || '')
      .toString()
      .trim();
    const r = this.formNap.get('caja_root_split')!.value;

    const abbr = this.cityAbbr(ciudad);

    if (!seg || !ruta || !r) {
      this.napNombrePreview = '—';
      return;
    }

    this.napNombrePreview = `${abbr}-NAP-${seg}-P${ruta}-R${r}`;
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
      const payload: any = {
        caja_segmento: (this.formPon.get('caja_segmento')!.value || '')
          .toString()
          .trim(),
        caja_root_split: this.formPon.get('caja_root_split')!.value,
        caja_estado: this.formPon.get('caja_estado')!.value,
        caja_hilo: (this.formPon.get('caja_hilo')!.value || '').toString(),
        caja_coordenadas: (
          this.formPon.get('caja_coordenadas')!.value || ''
        ).toString(),

        olt_id: this.formPon.get('olt_id')!.value,
        olt_slot: this.formPon.get('olt_slot')!.value,
        olt_pon: this.formPon.get('olt_pon')!.value,

        split_mode: this.formPon.get('split_mode')!.value,
      };

      const res: any = await this.cajasService.createPon(payload);

      const createdList =
        res?.data?.created && Array.isArray(res.data.created)
          ? res.data.created
          : [
              {
                id: res.data?.id,
                caja_nombre: res.data?.caja_nombre,
                caja_segmento: payload.caja_segmento,
              },
            ];

      for (const it of createdList) {
        this.created.emit({
          id: it.id,
          caja_tipo: 'PON',
          caja_nombre: it.caja_nombre,
          caja_estado: payload.caja_estado,
          caja_hilo: payload.caja_hilo,
          caja_coordenadas: payload.caja_coordenadas,
          caja_root_split: payload.caja_root_split,
          caja_segmento: it.caja_segmento ?? payload.caja_segmento,
        });
      }

      this.serverMsg = '✅ PON creada.';
      await this.loadPones();
      this.resetPonFormAfterCreate();
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
        caja_coordenadas: (
          this.formNap.get('caja_coordenadas')!.value || ''
        ).toString(),
      };

      const res = await this.cajasService.createNap(payload);

      this.created.emit({
        id: res.data.id,
        caja_tipo: 'NAP',
        caja_nombre: res.data.caja_nombre,
        caja_estado: payload.caja_estado as any,
        caja_hilo: payload.caja_hilo,
        caja_coordenadas: payload.caja_coordenadas,
        caja_root_split: payload.caja_root_split as any,
        caja_pon_id: ponId,
        caja_pon_ruta: payload.caja_pon_ruta!,
      });

      this.serverMsg = '✅ NAP creada.';
      await this.refreshRutasDisponibles(ponId);
      await this.refreshDisponibilidad(ponId);
      this.resetNapFormAfterCreate();
    } catch (e: any) {
      console.error(e);
      this.serverMsg = `❌ Error creando NAP: ${e?.error?.message || 'revisa el backend'}`;
    } finally {
      this.isSaving = false;
    }
  }

  private resetPonFormAfterCreate() {
    this.formPon.patchValue(
      {
        olt_pon: null,
        split_mode: '',
        caja_root_split: 8,
        caja_estado: 'ACTIVO',
        fibra_tipo: 'DROP',
        hilo_desconocido: false,
        simple_hilo: null,
        buffer: null,
        hilo_num: null,
        caja_coordenadas: '',
      },
      { emitEvent: false },
    );

    this.formPon.get('caja_hilo')!.setValue('', { emitEvent: false });
    this.syncHiloRules(this.formPon);
    this.syncHiloPreview(this.formPon);
    this.syncSegmentFromOlt();

    this.formPon.markAsPristine();
    this.formPon.markAsUntouched();
  }

  private resetNapFormAfterCreate() {
    this.formNap.patchValue(
      {
        caja_pon_id: null,
        caja_pon_ruta: '',
        caja_root_split: 16,
        caja_estado: 'ACTIVO',
        fibra_tipo: 'DROP',
        hilo_desconocido: false,
        simple_hilo: null,
        buffer: null,
        hilo_num: null,
        caja_coordenadas: '',
        expand_path: '',
        expand_factor: 2,
      },
      { emitEvent: false },
    );

    this.formNap.get('caja_hilo')!.setValue('', { emitEvent: false });
    this.syncHiloRules(this.formNap);
    this.syncHiloPreview(this.formNap);

    this.rutasDisponibles = [];
    this.ponInfo = null;
    this.updateNapNombrePreview();

    this.formNap.markAsPristine();
    this.formNap.markAsUntouched();
  }
}
