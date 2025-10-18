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
  if (!v) return null; // opcional
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
  @Input() coords: string | null = null; // coordenadas desde el mapa
  @Output() created = new EventEmitter<ICajas>(); // emite la caja creada
  @Output() requestPick = new EventEmitter<void>(); // pedir selección en mapa
  @Output() close = new EventEmitter<void>(); // cerrar panel

  private fb = inject(FormBuilder);
  private cajasService = inject(CajasService);

  isSaving = false;
  serverMsg = '';

  // opciones
  ciudades = ['LATACUNGA', 'SALCEDO'] as const;
  slots = [0, 1, 2, 4];
  pones = Array.from({ length: 16 }, (_, i) => i); // 0..15
  salidasNap = Array.from({ length: 16 }, (_, i) => i + 1); // 1..16
  simpleHilos = [1, 2]; // para DROP y FLAT
  buffers = [1, 2, 3, 4];
  hilos = [1, 2, 3, 4, 5, 6];

  form = this.fb.group({
    // estándar
    caja_ciudad: ['LATACUNGA', Validators.required],
    caja_tipo: ['PON', Validators.required], // PON | NAP
    slot: [null as number | null, Validators.required],
    pon: [null as number | null, Validators.required],
    nap: [null as number | null], // req si NAP
    caja_nombre: [{ value: '', disabled: true }], // auto
    caja_estado: ['DISEÑO', Validators.required], // DISEÑO | ACTIVO

    // fibra
    fibra_tipo: ['DROP', Validators.required], // DROP | FLAT | ADSS | MINIADSS
    hilo_desconocido: [false],
    simple_hilo: [null as number | null], // req si DROP/FLAT y no desconocido
    buffer: [null as number | null], // req si ADSS/MINIADSS y no desconocido
    hilo_num: [null as number | null], // req si ADSS/MINIADSS y no desconocido
    caja_hilo: [{ value: '', disabled: true }], // preview auto

    // geo
    caja_coordenadas: ['', coordsValidator], // opcional
  });

  get f() {
    return this.form.controls;
  }
  get hiloDesconocido(): boolean {
    return this.form.get('hilo_desconocido')!.value === true;
  }
  isTipoNAP(): boolean {
    return this.form.get('caja_tipo')!.value === 'NAP';
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
    // Reglas dinámicas por tipo de caja
    this.form.get('caja_tipo')!.valueChanges.subscribe(() => {
      this.syncNombre();
      const napCtrl = this.form.get('nap')!;
      if (this.isTipoNAP()) {
        napCtrl.setValidators([Validators.required]);
      } else {
        napCtrl.clearValidators();
        napCtrl.setValue(null, { emitEvent: false });
      }
      napCtrl.updateValueAndValidity({ emitEvent: false });
    });

    // Componer nombre al cambiar piezas
    ['slot', 'pon', 'nap'].forEach((k) => {
      this.form.get(k)!.valueChanges.subscribe(() => this.syncNombre());
    });

    // Reglas de fibra y preview
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

  // ==== Nombre auto ====
  private syncNombre() {
    const tipo = this.form.get('caja_tipo')!.value as 'PON' | 'NAP';
    const slot = this.form.get('slot')!.value;
    const pon = this.form.get('pon')!.value;
    const nap = this.form.get('nap')!.value;

    let nombre = '';
    if (tipo === 'PON') {
      if (slot !== null && pon !== null) nombre = `PON ${slot}/${pon}`;
    } else {
      if (slot !== null && pon !== null && nap !== null)
        nombre = `NAP ${slot}/${pon}/${nap}`;
    }
    this.form.get('caja_nombre')!.setValue(nombre, { emitEvent: false });
  }

  // ==== Reglas de hilo ====
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

  // ==== Preview de hilo ====
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
      const tipo = this.form.get('caja_tipo')!.value as 'PON' | 'NAP';
      const slot = this.form.get('slot')!.value!;
      const pon = this.form.get('pon')!.value!;
      const nap = this.form.get('nap')!.value;
      const nombre =
        tipo === 'PON' ? `PON ${slot}/${pon}` : `NAP ${slot}/${pon}/${nap}`;

      const fibra = this.form.get('fibra_tipo')!.value as
        | 'DROP'
        | 'FLAT'
        | 'ADSS'
        | 'MINIADSS';
      const unknown = this.hiloDesconocido;

      let hiloStr = '';
      if (unknown) {
        hiloStr = `${fibra} DESCONOCIDO`;
      } else if (fibra === 'DROP' || fibra === 'FLAT') {
        hiloStr = `${fibra} ${this.form.get('simple_hilo')!.value}`;
      } else {
        hiloStr = `${fibra} ${this.form.get('buffer')!.value}/${
          this.form.get('hilo_num')!.value
        }`;
      }

      const estado = this.form.get('caja_estado')!.value as string;
      const coords = this.form.get('caja_coordenadas')!.value as string;
      const ciudad = this.form.get('caja_ciudad')!.value as
        | 'LATACUNGA'
        | 'SALCEDO';

      const payload: Partial<ICajas> = {
        caja_tipo: tipo,
        caja_nombre: nombre,
        caja_estado: estado,
        caja_hilo: hiloStr,
        caja_coordenadas: coords || undefined,
        caja_ciudad: ciudad,
      };

      const res = await this.cajasService.createCaja(payload);
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
        slot: null,
        pon: null,
        nap: null,
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
      this.syncNombre();
      this.syncHiloPreview();
    } catch (e) {
      console.error(e);
      this.serverMsg = 'Error al crear la caja.';
    } finally {
      this.isSaving = false;
    }
  }

  get nameWidth(): number {
    const v = this.form.get('caja_nombre')!.value as string | null;
    const len = v?.length ?? 0;
    const base = len > 0 ? len : 10; // ancho mínimo equivalente a 10 chars
    return Math.max(140, base * 8); // 8px aprox por carácter
  }
}
