import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class SoketService {
  // private socket = io('http://localhost:3000'); // Servidor WebSocket
  private socket = io(`${environment.API_WEBSOKETS_IO}`); // Conexión con WebSocket
  constructor() {}

  // Método para recibir eventos del servidor
  escucharActualizaciones(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('actualizarPagina', (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      };
    });
  }
}
