import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

import { InfraestructuraService } from '../../../../services/negocio_latacunga/infraestructura.service';
import { ImagesService } from '../../../../services/negocio_latacunga/images.service';
import { SoketService } from '../../../../services/socket_io/soket.service';

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

  router = inject(Router);
  infraService = inject(InfraestructuraService);
  imagesService = inject(ImagesService);
  socketService = inject(SoketService);

  // Suavizado de render
  isReady = false;
  isSubmitting = false;

  // Previews para los 2 slots
  previewImg_ref1: string | null = null;
  previewImg_ref2: string | null = null;

  constructor(private fb: FormBuilder) {
    this.infraestructuraForm = this.fb.group({
      nombre: new FormControl<string | null>(null, [Validators.required]),
      coordenadas: new FormControl<string | null>(null, [
        Validators.required,
        Validators.pattern(/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/),
      ]),
      observacion: new FormControl<string | null>(null, [Validators.required]),
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

  // Pegado desde portapapeles
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
        break;
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

  clearImage(field: ImgField) {
    this.infraestructuraForm.get(field)?.setValue(null);
    if (field === 'img_ref1') this.previewImg_ref1 = null;
    if (field === 'img_ref2') this.previewImg_ref2 = null;
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

      // 1) Crear infraestructura (tu backend ya crea también la agenda dentro)
      const resp = await this.infraService.createInfra({
        nombre: resto.nombre,
        coordenadas: resto.coordenadas,
        observacion: resto.observacion,
      });

      const infraId = resp?.id;
      if (!infraId) throw new Error('No se recibió el ID del registro creado');

      // 2) Subir imágenes
      const uploads: Promise<any>[] = [];

      if (img_ref1) {
        uploads.push(
          firstValueFrom(
            this.imagesService.upload('infraestructura', infraId, img_ref1, {
              tag: 'referencia',
              position: 1,
            }),
          ),
        );
      }

      if (img_ref2) {
        uploads.push(
          firstValueFrom(
            this.imagesService.upload('infraestructura', infraId, img_ref2, {
              tag: 'referencia',
              position: 2,
            }),
          ),
        );
      }

      if (uploads.length) {
        const results = await Promise.allSettled(uploads);
        results.forEach((r) => {
          if (r.status === 'rejected') {
            console.error('❌ Error subiendo imagen:', r.reason);
          }
        });
      }

      // 3) ✅ SOCKET: notificar que hubo preagenda nueva
      // (como tu backend escucha "trabajoPreagendado" sin payload)
      await this.socketService.connectSocket(); // seguro aunque ya esté conectado
      this.socketService.emit('trabajoPreagendado');

      // 4) Limpieza + navegar
      this.infraestructuraForm.patchValue({ img_ref1: null, img_ref2: null });
      this.previewImg_ref1 = null;
      this.previewImg_ref2 = null;

      await this.router.navigateByUrl(`/home/noc/agenda`);
    } catch (error) {
      console.error(
        '❌ Error creando infraestructura / subiendo imágenes:',
        error,
      );
    } finally {
      this.isSubmitting = false;
    }
  }
}
