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
  // ✅ cambia esto si tu backend está en otra URL
  private readonly API_BASE = 'http://localhost:3000';
  private readonly ENDPOINT = '/api/olt/test';

  estado: Estado = 'IDLE';
  mensaje = '';
  output = '';
  debug = false;

  private cooldownTimer: any = null;
  cooldownSec = 0;

  async conectar() {
    if (this.estado === 'CONECTANDO' || this.estado === 'COOLDOWN') return;

    this.estado = 'CONECTANDO';
    this.mensaje = 'Conectando...';
    this.output = '';

    const url = new URL(this.API_BASE + this.ENDPOINT);
    if (this.debug) url.searchParams.set('debug', 'true');

    try {
      const resp = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      const data = await resp.json().catch(() => ({}));

      // ✅ cooldown (429) desde backend
      if (resp.status === 429) {
        this.estado = 'COOLDOWN';
        this.mensaje = data?.error?.message || 'Espera antes de reintentar';
        this.output = '';
        this.iniciarCooldownDesdeMensaje(this.mensaje);
        return;
      }

      if (!resp.ok || !data?.ok) {
        this.estado = 'ERROR';
        this.mensaje =
          data?.error?.message || data?.message || `Error HTTP ${resp.status}`;
        this.output = '';
        return;
      }

      // ✅ OK
      this.estado = 'OK';
      this.mensaje = data?.message || 'Conexión establecida';
      this.output = data?.output || '';
    } catch (e: any) {
      this.estado = 'ERROR';
      this.mensaje = e?.message || 'Error de conexión';
      this.output = '';
    }
  }

  // Si el backend manda "espera 12s..." lo usamos para un contador visual
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
