import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CajasService } from '../../../../../services/negocio_latacunga/cajas.services';
import { ICajas } from '../../../../../interfaces/negocio/infraestructura/icajas.interface';

function coordsValidator(ctrl: AbstractControl) {
  const v = (ctrl.value ?? '').toString().trim();
  if (!v) return null;
  const m = v.match(/^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/);
  if (!m) return { coords: 'Formato inválido. Use "lat,lng".' };
  const lat = +m[1],
    lng = +m[3];
  if (lat < -90 || lat > 90)
    return { coords: 'Latitud fuera de rango (-90 a 90).' };
  if (lng < -180 || lng > 180)
    return { coords: 'Longitud fuera de rango (-180 a 180).' };
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
  @Output() requestPick = new EventEmitter<void>();
  @Output() created = new EventEmitter<ICajas>();
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private cajasService = inject(CajasService);

  isSaving = false;
  serverMsg = '';

  form = this.fb.group({
    caja_tipo: ['', [Validators.required, Validators.maxLength(50)]],
    caja_nombre: ['', [Validators.required, Validators.maxLength(120)]],
    caja_estado: ['', [Validators.maxLength(50)]],
    caja_hilo: ['', [Validators.maxLength(120)]],
    caja_coordenadas: ['', [coordsValidator]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('coords' in changes && this.coords) {
      this.form.patchValue({ caja_coordenadas: this.coords });
    }
  }

  async submit(): Promise<void> {
    this.serverMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    try {
      const payload = this.form.getRawValue() as Partial<ICajas>;
      const res = await this.cajasService.createCaja(payload);
      this.created.emit({
        id: res.data.id,
        caja_tipo: res.data.caja_tipo,
        caja_nombre: res.data.caja_nombre,
        caja_estado: res.data.caja_estado,
        caja_hilo: res.data.caja_hilo,
        caja_coordenadas: res.data.caja_coordenadas,
      });
      this.serverMsg = 'Caja creada correctamente.';
      this.form.reset({ caja_estado: 'DISEÑO' });
    } catch (e) {
      console.error(e);
      this.serverMsg = 'Error al crear la caja.';
    } finally {
      this.isSaving = false;
    }
  }
}
