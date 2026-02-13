import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Estado = 'IDLE' | 'CONECTANDO' | 'OK' | 'ERROR' | 'COOLDOWN';

@Component({
  selector: 'app-olt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './olt.component.html',
  styleUrl: './olt.component.css',
})
export class OltComponent {
  private readonly API_BASE = 'http://localhost:3000';
  private readonly ENDPOINT = '/api/olt/test';

  estado: Estado = 'IDLE';
  mensaje = '';
  output = '';
  time = ''; // ✅ NUEVO: fecha/hora de la OLT
  debug = false;

  private cooldownTimer: any = null;
  cooldownSec = 0;

  async conectar() {
    if (this.estado === 'CONECTANDO' || this.estado === 'COOLDOWN') return;

    this.estado = 'CONECTANDO';
    this.mensaje = 'Conectando...';
    this.output = '';
    this.time = ''; // ✅ limpiar

    const url = new URL(this.API_BASE + this.ENDPOINT);
    if (this.debug) url.searchParams.set('debug', 'true');

    try {
      const resp = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      const data = await resp.json().catch(() => ({}));

      if (resp.status === 429) {
        this.estado = 'COOLDOWN';
        this.mensaje = data?.error?.message || 'Espera antes de reintentar';
        this.output = '';
        this.time = '';
        this.iniciarCooldownDesdeMensaje(this.mensaje);
        return;
      }

      if (!resp.ok || !data?.ok) {
        this.estado = 'ERROR';
        this.mensaje =
          data?.error?.message || data?.message || `Error HTTP ${resp.status}`;
        this.output = '';
        this.time = '';
        return;
      }

      // ✅ OK
      this.estado = 'OK';
      this.mensaje = data?.message || 'Conexión establecida';

      // ✅ OLT time viene como: "12-02-2026 18:56:09-05:00"
      this.time = this.formatearTime(data?.time || '');

      // ✅ si debug=true, el backend manda "raw"
      //    si debug=false, normalmente NO manda raw; puedes dejar output vacío
      this.output = data?.raw || '';
    } catch (e: any) {
      this.estado = 'ERROR';
      this.mensaje = e?.message || 'Error de conexión';
      this.output = '';
      this.time = '';
    }
  }

  private formatearTime(t: string) {
    // Mantener simple: solo reemplaza el formato DD-MM-YYYY por YYYY-MM-DD si quieres
    // o déjalo tal cual si te gusta.
    // Ejemplo: "12-02-2026 18:56:09-05:00" => "12/02/2026 18:56:09 (-05:00)"
    if (!t) return '';
    return t.replace(/^(\d{2})-(\d{2})-(\d{4})\s+/, '$1/$2/$3 ');
  }

  private iniciarCooldownDesdeMensaje(msg: string) {
    this.limpiarCooldown();
    const m = /espera\s+(\d+)s/i.exec(msg);
    this.cooldownSec = m ? Number(m[1]) : 30;

    this.cooldownTimer = setInterval(() => {
      this.cooldownSec -= 1;
      if (this.cooldownSec <= 0) {
        this.limpiarCooldown();
        this.estado = 'IDLE';
        this.mensaje = '';
      } else {
        this.mensaje = `Espera ${this.cooldownSec}s antes de reintentar`;
      }
    }, 1000);
  }

  private limpiarCooldown() {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = null;
    this.cooldownSec = 0;
  }

  get badgeClass() {
    switch (this.estado) {
      case 'OK':
        return 'badge ok';
      case 'ERROR':
        return 'badge err';
      case 'COOLDOWN':
        return 'badge cool';
      case 'CONECTANDO':
        return 'badge con';
      default:
        return 'badge idle';
    }
  }

  get estadoTexto() {
    switch (this.estado) {
      case 'OK':
        return 'Conexión establecida';
      case 'ERROR':
        return 'Error de conexión';
      case 'COOLDOWN':
        return 'Espera';
      case 'CONECTANDO':
        return 'Conectando';
      default:
        return 'Sin conexión';
    }
  }
}
