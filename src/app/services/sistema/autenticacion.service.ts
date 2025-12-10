// src/app/.../autenticacion.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Iusuarios } from '../../interfaces/sistema/iusuarios.interface';
import { Router } from '@angular/router';

type LoginBody = { usuario: string; password: string };

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  private baseUrl: string = `${environment.API_URL}/login`;
  private usuario: Iusuarios | null = null;

  /** ⏱️ NUEVO: timer interno para auto-logout */
  private sessionTimer: any;

  /** 🔎 acceso de solo lectura al usuario en memoria (igual) */
  get usuarioEnMemoria(): Iusuarios | null {
    return this.usuario;
  }

  /** ⏱️ NUEVO: programa auto-logout exacto según fecha ISO del header */
  scheduleAutoLogout(expiresIso: string) {
    try {
      const ms = new Date(expiresIso).getTime() - Date.now();
      if (Number.isFinite(ms) && ms > 0) {
        clearTimeout(this.sessionTimer);
        this.sessionTimer = setTimeout(() => {
          // al vencer: limpiar estado y mandar a login
          this.clearSession();
          this.router.navigateByUrl('/login');
        }, ms + 250); // pequeño margen
      }
    } catch {
      // si el header no es válido, no programamos nada
    }
  }

  /** ⏱️ NUEVO: limpia estado y cualquier timer */
  clearSession() {
    this.usuario = null;
    clearTimeout(this.sessionTimer);
  }

  /** 🔎 intenta rehidratar usuario UNA sola vez si no existe en memoria (igual, pero leyendo header) */
  async hydrateSessionOnce(): Promise<Iusuarios | null> {
    if (this.usuario) return this.usuario;
    try {
      const resp = await firstValueFrom(
        this.httpClient.get<Iusuarios>(`${this.baseUrl}/me`, {
          withCredentials: true,
          observe: 'response', // 👈 para leer headers
        })
      );
      // agenda auto-logout si el backend envía X-Session-Expires
      const exp = resp.headers.get('X-Session-Expires');
      if (exp) this.scheduleAutoLogout(exp);

      this.usuario = resp.body as Iusuarios;
      return this.usuario;
    } catch {
      this.usuario = null;
      return null;
    }
  }

  // LOGIN (igual; tras login obtenemos /me y se agenda el auto-logout)
  async login(body: LoginBody): Promise<void> {
    await firstValueFrom(
      this.httpClient.post(`${this.baseUrl}`, body, { withCredentials: true })
    );
    this.usuario = await this.getUsuarioAutenticado();
  }

  // LOGOUT (igual; ahora también limpiamos timer)
  async logout(usuario_id: number): Promise<void> {
    await firstValueFrom(
      this.httpClient.post(
        `${this.baseUrl}/not`,
        { usuario_id },
        { withCredentials: true }
      )
    );
    this.clearSession();
  }

  // OBTENER USUARIO AUTENTICADO (igual retorno; ahora lee header para programar)
  async getUsuarioAutenticado(): Promise<Iusuarios> {
    const resp = await firstValueFrom(
      this.httpClient.get<Iusuarios>(`${this.baseUrl}/me`, {
        withCredentials: true,
        observe: 'response', // 👈 para leer headers
      })
    );
    const exp = resp.headers.get('X-Session-Expires');
    if (exp) this.scheduleAutoLogout(exp);

    const user = resp.body as Iusuarios;
    this.usuario = user;
    return user;
  }

  get sucursalActualId(): number | null {
    return this.usuario?.sucursal_id ?? null;
  }

  get sucursalActualNombre(): string | null {
    return this.usuario?.sucursal_nombre ?? null;
  }

  get departamentoActualId(): number | null {
    return this.usuario?.departamento_id ?? null;
  }

  get departamentoActualNombre(): string | null {
    return this.usuario?.departamento_nombre ?? null;
  }

  get roles(): string[] {
    return this.usuario?.rol ?? [];
  }

  hasRol(nombreRol: string): boolean {
    return (this.usuario?.rol ?? []).includes(nombreRol);
  }
}
