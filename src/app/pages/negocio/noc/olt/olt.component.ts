import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { OltService } from '../../../../services/negocio_latacunga/olt.services';

type Estado = 'IDLE' | 'CONNECTING' | 'OK' | 'ERROR';

@Component({
  selector: 'app-olt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './olt.component.html',
  styleUrl: './olt.component.css',
})
export class OltComponent {
  estado: Estado = 'IDLE';
  detalle = ''; // mensaje de OK o error (opcional)

  constructor(private olt: OltService) {}

  conectar() {
    this.estado = 'CONNECTING';
    this.detalle = '';

    this.olt
      .testConnection()
      .pipe(finalize(() => {}))
      .subscribe({
        next: (resp) => {
          if (resp?.ok) {
            this.estado = 'OK';
            this.detalle = resp.message || 'Conexión establecida.';
          } else {
            this.estado = 'ERROR';
            this.detalle = resp?.error || 'Error de conexión.';
          }
        },
        error: (err) => {
          this.estado = 'ERROR';
          this.detalle =
            err?.error?.error ||
            err?.error?.message ||
            err?.message ||
            'Error de conexión.';
        },
      });
  }

  get estadoLabel() {
    switch (this.estado) {
      case 'CONNECTING':
        return 'Conectando...';
      case 'OK':
        return 'Conexión establecida';
      case 'ERROR':
        return 'Error de conexión';
      default:
        return 'Sin probar';
    }
  }
}
