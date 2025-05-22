import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AutenticacionService } from '../sistema/autenticacion.service';

@Injectable({
  providedIn: 'root',
})
export class SoketService {
  private socket: Socket | null = null;
  private isSocketConnected = false;

  constructor(private authService: AutenticacionService) {}

  async connectSocket(): Promise<void> {
    try {
      const usuario = await this.authService.getUsuarioAutenticado(); // ✅ llamado real al backend

      if (!usuario?.id) {
        console.warn('⚠️ No se conecta el socket: usuario.id indefinido');
        return;
      }

      if (this.isSocketConnected) {
        console.warn('⚠️ Ya hay un socket conectado (isSocketConnected)');
        return;
      }

      this.socket = io(environment.API_WEBSOKETS_IO, {
        query: { usuario_id: usuario.id.toString() },
        transports: ['websocket'],
        reconnection: true,
      });

      this.socket.on('connect', () => {
        this.isSocketConnected = true;
        console.log('✅ WebSocket conectado:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        this.isSocketConnected = false;
        console.log('❌ WebSocket desconectado:', this.socket?.id);
      });
    } catch (error) {
      console.error(
        '❌ No se pudo obtener el usuario para conectar socket:',
        error
      );
    }
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isSocketConnected = false;
      this.socket = null;
      console.log('🧹 WebSocket desconectado manualmente');
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
