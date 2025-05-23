import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Iclientes } from '../../interfaces/negocio/clientes/iclientes.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private baseUrl: string = `${environment.API_URL}/clientes`;
  private httpClient = inject(HttpClient);

  // NOMBRE COMPLETO Y CEDULA DE TODOS LOS CLIENTES
  getInfoClientes() {
    return lastValueFrom(
      this.httpClient.get<[]>(`${this.baseUrl}`, {
        withCredentials: true,
      })
    );
  }

  getInfoClientesActivos() {
    return lastValueFrom(
      this.httpClient.get<[]>(`${this.baseUrl}/activos`, {
        withCredentials: true,
      })
    );
  }

  getInfoClientesArray(cedula: string): Promise<Iclientes> {
    return lastValueFrom(
      this.httpClient.get<Iclientes>(`${this.baseUrl}/data/${cedula}`, {
        withCredentials: true,
      })
    );
  }

  getInfoClientesArrayActivos(cedula: string): Promise<Iclientes> {
    return lastValueFrom(
      this.httpClient.get<Iclientes>(`${this.baseUrl}/data-act/${cedula}`, {
        withCredentials: true,
      })
    );
  }

  getInfoClientesMapa() {
    return lastValueFrom(
      this.httpClient.get<[]>(`${this.baseUrl}/mapas`, {
        withCredentials: true,
      })
    );
  }

  getInfoServicioByOrdId(ord_ins: number): Promise<Iclientes> {
    return lastValueFrom(
      this.httpClient.get<Iclientes>(`${this.baseUrl}/${ord_ins}`, {
        withCredentials: true,
      })
    );
  }
}
