// soket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AutenticacionService } from '../sistema/autenticacion.service';

@Injectable({
  providedIn: 'root',
})
export class SoketService {
  private socket: Socket | null = null;

  constructor(private authService: AutenticacionService) {}

  connectSocket(): void {
    const usuario = this.authService.datosLogged();

    if (!usuario?.usuario_id) {
      console.warn('⚠️ No se conecta el socket: usuario_id undefined');
      return;
    }

    if (this.socket) {
      console.warn('⚠️ Ya hay un socket creado, evita duplicados');
      return;
    }

    this.socket = io(environment.API_WEBSOKETS_IO, {
      query: {
        usuario_id: usuario.usuario_id,
      },
      transports: ['websocket'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado:', this.socket?.id);
    });
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🧹 WebSocket desconectado manualmente');
      this.socket = null;
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data?: any) => void): void {
    this.socket?.off(event); // limpiar anteriores
    this.socket?.on(event, callback);
  }
}
