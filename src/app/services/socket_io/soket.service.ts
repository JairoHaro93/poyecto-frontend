import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AutenticacionService } from '../sistema/autenticacion.service';

@Injectable({ providedIn: 'root' })
export class SoketService {
  private socket: Socket | null = null;
  private isSocketConnected = false;
  private connecting = false;

  // callbacks por evento
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();
  private boundEvents = new Set<string>();

  // cola de emits antes de que exista/Conecte el socket
  private emitQueue: Array<{ event: string; data?: any }> = [];

  constructor(private authService: AutenticacionService) {}

  async connectSocket(): Promise<void> {
    try {
      // ✅ Si ya existe socket (conectando o conectado), no crees otro
      if (this.socket || this.connecting) return;

      this.connecting = true;

      const usuario = await this.authService.getUsuarioAutenticado();
      if (!usuario?.id) {
        console.warn('⚠️ No se conecta el socket: usuario.id indefinido');
        this.connecting = false;
        return;
      }

      this.socket = io(environment.API_WEBSOKETS_IO, {
        query: { usuario_id: usuario.id.toString() },
        transports: ['websocket'],
        reconnection: true,
      });

      // ✅ Enlaza todos los eventos que ya te registraron con on()
      this.bindAllEvents();

      this.socket.on('connect', () => {
        this.isSocketConnected = true;
        this.connecting = false;
        this.flushQueue();
      });

      this.socket.on('disconnect', () => {
        this.isSocketConnected = false;
      });

      this.socket.on('connect_error', (err) => {
        // No mates el servicio, solo log
        console.error('❌ connect_error socket:', err);
      });
    } catch (error) {
      console.error('❌ No se pudo conectar socket:', error);
      this.connecting = false;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isSocketConnected = false;
      this.connecting = false;
      this.listeners.clear();
      this.boundEvents.clear();
      this.emitQueue = [];
    }
  }

  emit(event: string, data?: any): void {
    // ✅ Si aún no hay socket, encola y dispara conexión
    if (!this.socket) {
      this.emitQueue.push({ event, data });
      void this.connectSocket(); // fire & forget
      return;
    }

    // ✅ No verificamos connected: Socket.IO hace cola internamente, pero ya con socket creado
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void): void {
    // ✅ Guarda callback aunque no exista socket aún
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    const arr = this.listeners.get(event)!;

    if (!arr.includes(callback)) arr.push(callback);

    // ✅ Asegura que el evento quede “bindeado” al socket cuando exista
    if (this.socket) this.bindEvent(event);
    else void this.connectSocket();
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) return;

    if (callback) {
      const updated = this.listeners
        .get(event)!
        .filter((cb) => cb !== callback);

      if (updated.length === 0) {
        this.listeners.delete(event);
        this.boundEvents.delete(event);
        if (this.socket) this.socket.off(event);
      } else {
        this.listeners.set(event, updated);
      }
      return;
    }

    // borrar todos
    this.listeners.delete(event);
    this.boundEvents.delete(event);
    if (this.socket) this.socket.off(event);
  }

  // =====================
  // helpers internos
  // =====================
  private bindAllEvents() {
    for (const event of this.listeners.keys()) this.bindEvent(event);
  }

  private bindEvent(event: string) {
    if (!this.socket) return;
    if (this.boundEvents.has(event)) return;

    this.boundEvents.add(event);

    this.socket.on(event, (...args) => {
      this.listeners.get(event)?.forEach((cb) => cb(...args));
    });
  }

  private flushQueue() {
    if (!this.socket) return;
    if (!this.emitQueue.length) return;

    const queue = [...this.emitQueue];
    this.emitQueue = [];

    for (const item of queue) {
      this.socket.emit(item.event, item.data);
    }
  }
}
