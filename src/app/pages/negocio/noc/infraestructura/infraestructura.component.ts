import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import {
  CreateInfraDto,
  InfraestructuraService,
} from '../../../../services/negocio_latacunga/infraestructura.service';

import { firstValueFrom } from 'rxjs';
import { ImagesService } from '../../../../services/negocio_latacunga/images.service';

type ImgField = 'img_ref1' | 'img_ref2';

@Component({
  selector: 'app-infraestructura',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './infraestructura.component.html',
  styleUrl: './infraestructura.component.css',
})
export class InfraestructuraComponent {
  infraestructuraForm!: FormGroup;

  // Suavizado de render
  isReady = false;
  isSubmitting = false;

  // Previews para los 2 slots
  previewImg_ref1: string | null = null;
  previewImg_ref2: string | null = null;

  // SERVICIOS
  agendaService = inject(AgendaService);
  infraService = inject(InfraestructuraService);
  imagesService = inject(ImagesService);

  constructor(private fb: FormBuilder) {
    this.infraestructuraForm = this.fb.group({
      nombre: new FormControl<string | null>(null, [Validators.required]),
      coordenadas: new FormControl<string | null>(null, [
        Validators.required,
        // lat,lng con o sin espacios
        Validators.pattern(/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/),
      ]),
      observacion: new FormControl<string | null>(null, [Validators.required]),

      // Imágenes opcionales
      img_ref1: new FormControl<File | null>(null),
      img_ref2: new FormControl<File | null>(null),
    });

    this.isReady = true;
  }

  convertToUppercase(field: string): void {
    const control = this.infraestructuraForm.get(field);
    if (control) {
      const value = String(control.value ?? '');
      control.setValue(value.toUpperCase(), { emitEvent: false });
    }
  }

  checkError(controlName: string, error: string): boolean {
    const control = this.infraestructuraForm.get(controlName);
    return !!(control?.touched && control.hasError(error));
  }

  // Pegado desde portapapeles (compatible sin dom.iterable)
  handlePaste(event: ClipboardEvent, field: ImgField) {
    event.preventDefault();

    const dt = event.clipboardData;
    if (!dt || !dt.items || dt.items.length === 0) return;

    for (let i = 0; i < dt.items.length; i++) {
      const item = dt.items[i];
      if (item.kind === 'file' && item.type?.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          this.infraestructuraForm.get(field)?.setValue(file);
          this.fileToDataURL(file).then((dataUrl) => {
            if (field === 'img_ref1') this.previewImg_ref1 = dataUrl;
            else this.previewImg_ref2 = dataUrl;
          });
        }
        break; // usamos la primera imagen encontrada
      }
    }
  }

  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  async submitForm(): Promise<void> {
    if (this.infraestructuraForm.invalid) {
      this.infraestructuraForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    try {
      const { img_ref1, img_ref2, ...resto } = this.infraestructuraForm
        .value as {
        nombre: string;
        coordenadas: string;
        observacion: string;
        img_ref1: File | null;
        img_ref2: File | null;
      };

      // 1) Crear registro base en neg_t_infraestructura
      const resp = await this.infraService.createInfra({
        nombre: resto.nombre,
        coordenadas: resto.coordenadas,
        observacion: resto.observacion,
      });

      const infraId = resp?.id;
      if (!infraId) throw new Error('No se recibió el ID del registro creado');

      const uploads: Promise<any>[] = [];

      if (img_ref1) {
        uploads.push(
          firstValueFrom(
            this.imagesService.upload('infraestructura', infraId, img_ref1, {
              tag: 'referencia',
              position: 1,
            })
          )
        );
      }
      if (img_ref2) {
        uploads.push(
          firstValueFrom(
            this.imagesService.upload('infraestructura', infraId, img_ref2, {
              tag: 'referencia',
              position: 2,
            })
          )
        );
      }

      if (uploads.length) {
        const results = await Promise.allSettled(uploads);
        results.forEach((r, idx) => {
          const campo = idx === 0 && img_ref1 ? 'img_ref1' : 'img_ref2';
          if (r.status === 'fulfilled') {
            console.log(`✅ ${campo} subida correctamente`, r.value);
          } else {
            console.error(`❌ Error subiendo ${campo}`, r.reason);
          }
        });
      } else {
        console.log('ℹ️ No se adjuntaron imágenes, solo se creó el registro.');
      }

      console.log('✅ Infraestructura creada. ID:', infraId);

      // (Opcional) limpiar imágenes del formulario y previews
      this.infraestructuraForm.patchValue({ img_ref1: null, img_ref2: null });
      this.previewImg_ref1 = null;
      this.previewImg_ref2 = null;

      // (Opcional) limpiar todo:
      // this.infraestructuraForm.reset();
    } catch (error) {
      console.error(
        '❌ Error creando infraestructura / subiendo imágenes:',
        error
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  clearImage(field: ImgField) {
    this.infraestructuraForm.get(field)?.setValue(null);
    if (field === 'img_ref1') this.previewImg_ref1 = null;
    if (field === 'img_ref2') this.previewImg_ref2 = null;
  }
}
