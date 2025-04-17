import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Iclientes } from '../../interfaces/negocio/clientes/iclientes.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  //variables
  private baseUrl: string = `${environment.API_URL}/clientes`;

  //injectables
  private httpClient = inject(HttpClient);

  //metodos

  getInfoClientes() {
    return lastValueFrom(this.httpClient.get<[]>(`${this.baseUrl}`));
  }

  getInfoClientesActivos() {
    return lastValueFrom(this.httpClient.get<[]>(`${this.baseUrl}/activos`));
  }

  getInfoClientesArray(cedula: string): Promise<Iclientes> {
    return lastValueFrom(
      this.httpClient.get<Iclientes>(`${this.baseUrl}/data/${cedula}`)
    );
  }

  getInfoClientesArrayActivos(cedula: string): Promise<Iclientes> {
    return lastValueFrom(
      this.httpClient.get<Iclientes>(`${this.baseUrl}/data-act/${cedula}`)
    );
  }

  getInfoClientesMapa() {
    return lastValueFrom(this.httpClient.get<[]>(`${this.baseUrl}/mapas`));
  }

  getInfoServicioByOrdId(ord_ins: number) {
    return lastValueFrom(
      this.httpClient.get<{
        nombre_completo: string;
        coordenadas: string;
        telefonos: string;
        direccion: string;
        referencia: string;
        plan_nombre: string;
        [key: string]: any; // para permitir campos adicionales
      }>(`${this.baseUrl}/${ord_ins}`)
    );
  }
}
