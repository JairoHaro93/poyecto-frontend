import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
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

@Component({
  selector: 'app-mapa-cajas-controls',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mapa-cajas-controls.component.html',
  styleUrls: ['./mapa-cajas-controls.component.css'],
})
export class MapaCajasControlsComponent implements OnChanges {
  @Input() coords: string | null = null;
  @Output() created = new EventEmitter<ICajas>();
  @Output() requestPick = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private cajasService = inject(CajasService);

  isSaving = false;
  serverMsg = '';

  // opciones
  ciudades = ['LATACUNGA', 'SALCEDO'] as const;
  sFinalOptions = [2, 4, 8, 16, 32, 64]; // selector "S final"

  // fibra / hilo (sin cambios)
  simpleHilos = [1, 2];
  buffers = [1, 2, 3, 4];
  hilos = [1, 2, 3, 4, 5, 6];

  // Mapa de abreviaturas de ciudad
  private cityAbbr: Record<string, string> = {
    LATACUNGA: 'LAT',
    SALCEDO: 'SAL',
  };

  form = this.fb.group({
    // Selecciones base
    caja_ciudad: ['LATACUNGA', Validators.required],
    caja_tipo: ['PON', Validators.required], // PON | NAP

    // NUEVO: el usuario solo escribe este segmento
    nombre_segmento: ['', [Validators.required, Validators.maxLength(80)]], // ej: 4/7/S2/1

    // NUEVO: selector de splitero final
    s_final: [null as number | null, Validators.required], // ej: 8 -> "/S8"

    // Nombre autogenerado (solo lectura)
    caja_nombre: [{ value: '', disabled: true }, Validators.required],

    // Estado
    caja_estado: ['DISEÑO', Validators.required], // DISEÑO | ACTIVO

    // Fibra / hilo (como lo tenías)
    fibra_tipo: ['DROP', Validators.required], // DROP | FLAT | ADSS | MINIADSS
    hilo_desconocido: [false],
    simple_hilo: [null as number | null],
    buffer: [null as number | null],
    hilo_num: [null as number | null],
    caja_hilo: [{ value: '', disabled: true }],

    // Geo
    caja_coordenadas: ['', coordsValidator],
  });

  get f() {
    return this.form.controls;
  }
  get hiloDesconocido(): boolean {
    return this.form.get('hilo_desconocido')!.value === true;
  }
  isFibraSimple(): boolean {
    const t = this.form.get('fibra_tipo')!.value as string;
    return t === 'DROP' || t === 'FLAT';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['coords']) {
      const c = (this.coords ?? '').toString();
      if (c)
        this.form.patchValue({ caja_coordenadas: c }, { emitEvent: false });
    }
  }

  constructor() {
    // Cuando cambien ciudad, tipo, segmento o S final => recomponer nombre
    ['caja_ciudad', 'caja_tipo', 'nombre_segmento', 's_final'].forEach(
      (key) => {
        this.form.get(key)!.valueChanges.subscribe(() => this.syncNombre());
      }
    );

    // Reglas de fibra y preview (igual que antes)
    this.form.get('fibra_tipo')!.valueChanges.subscribe(() => {
      this.syncHiloRules();
      this.syncHiloPreview();
    });
    this.form.get('hilo_desconocido')!.valueChanges.subscribe(() => {
      this.syncHiloRules();
      this.syncHiloPreview();
    });
    ['simple_hilo', 'buffer', 'hilo_num'].forEach((k) => {
      this.form.get(k)!.valueChanges.subscribe(() => this.syncHiloPreview());
    });

    // Inicial
    this.syncNombre();
    this.syncHiloRules();
    this.syncHiloPreview();
  }

  // === Nombre auto => "LAT-PON-4/7/S2/1/S8"
  private syncNombre() {
    const ciudad = (this.form.get('caja_ciudad')!.value || '').toString();
    const tipo = (this.form.get('caja_tipo')!.value || '')
      .toString()
      .toUpperCase();
    const seg = (this.form.get('nombre_segmento')!.value || '')
      .toString()
      .trim();
    const sFinal = this.form.get('s_final')!.value as number | null;

    const abbr = this.cityAbbr[ciudad] ?? ciudad.slice(0, 3).toUpperCase();
    const tail = sFinal ? `/S${sFinal}` : '';

    const nombre = seg
      ? `${abbr}-${tipo}-${seg}${tail}`
      : `${abbr}-${tipo}${tail}`;

    this.form.get('caja_nombre')!.setValue(nombre, { emitEvent: false });
  }

  // ==== Reglas / preview de hilo (como lo tenías) ====
  private syncHiloRules() {
    const tipo = this.form.get('fibra_tipo')!.value as
      | 'DROP'
      | 'FLAT'
      | 'ADSS'
      | 'MINIADSS';
    const unknown = this.hiloDesconocido;

    const simple = this.form.get('simple_hilo')!;
    const buf = this.form.get('buffer')!;
    const hilo = this.form.get('hilo_num')!;

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

  private syncHiloPreview() {
    const tipo = this.form.get('fibra_tipo')!.value as
      | 'DROP'
      | 'FLAT'
      | 'ADSS'
      | 'MINIADSS';
    const unknown = this.hiloDesconocido;
    const sh = this.form.get('simple_hilo')!.value;
    const buf = this.form.get('buffer')!.value;
    const hn = this.form.get('hilo_num')!.value;

    let preview = '';
    if (unknown) preview = `${tipo} DESCONOCIDO`;
    else if (tipo === 'DROP' || tipo === 'FLAT') {
      if (sh !== null) preview = `${tipo} ${sh}`;
    } else {
      if (buf !== null && hn !== null) preview = `${tipo} ${buf}/${hn}`;
    }
    this.form.get('caja_hilo')!.setValue(preview, { emitEvent: false });
  }

  // ==== Submit ====
  async submit(): Promise<void> {
    this.serverMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    try {
      const payload: Partial<ICajas> & { s_final?: number | null } = {
        caja_tipo: this.form.get('caja_tipo')!.value as 'PON' | 'NAP',
        caja_nombre: (this.form.get('caja_nombre')!.value || '').toString(),
        caja_estado: this.form.get('caja_estado')!.value as string,
        caja_hilo: (this.form.get('caja_hilo')!.value || '').toString(),
        caja_coordenadas:
          (this.form.get('caja_coordenadas')!.value || '').toString() ||
          undefined,
        caja_ciudad: this.form.get('caja_ciudad')!.value as
          | 'LATACUNGA'
          | 'SALCEDO',
        // “para luego”: si quieres guardarlo en BD cuando el backend lo soporte
        s_final: this.form.get('s_final')!.value,
      };

      const res = await this.cajasService.createCaja(payload as any);
      const nueva: ICajas = {
        id: res.data.id,
        caja_tipo: res.data.caja_tipo,
        caja_nombre: res.data.caja_nombre,
        caja_estado: res.data.caja_estado,
        caja_hilo: res.data.caja_hilo,
        caja_coordenadas: res.data.caja_coordenadas,
        caja_ciudad: res.data.caja_ciudad,
      };

      this.created.emit(nueva);
      this.serverMsg = 'Caja creada correctamente.';

      this.form.reset({
        caja_ciudad: 'LATACUNGA',
        caja_tipo: 'PON',
        nombre_segmento: '',
        s_final: null,
        caja_nombre: '',
        caja_estado: 'DISEÑO',
        fibra_tipo: 'DROP',
        hilo_desconocido: false,
        simple_hilo: null,
        buffer: null,
        hilo_num: null,
        caja_hilo: '',
        caja_coordenadas: '',
      });
      this.syncHiloRules();
      this.syncHiloPreview();
      this.syncNombre();
    } catch (e) {
      console.error(e);
      this.serverMsg = 'Error al crear la caja.';
    } finally {
      this.isSaving = false;
    }
  }

  // ancho del input “Nombre” (si lo sigues mostrando)
  get nameWidth(): number {
    const v = this.form.get('caja_nombre')!.value as string | null;
    const len = v?.length ?? 0;
    const base = len > 0 ? len : 10;
    return Math.max(140, base * 8);
  }
}
