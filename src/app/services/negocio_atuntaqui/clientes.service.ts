import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Iclientes } from '../../interfaces/negocio/clientes/iclientes.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private baseUrl: string = `${environment.API_URL}/clientes`;
  private httpClient = inject(HttpClient);

  buscarClientesActivos(q: string, limit = 10) {
    const params = new HttpParams().set('q', q).set('limit', String(limit));
    return lastValueFrom(
      this.httpClient.get<{ cedula: string; nombre_completo: string }[]>(
        `${this.baseUrl}/activos`,
        { params, withCredentials: true }
      )
    );
  }

  buscarClientes(q: string, limit = 10) {
    const params = new HttpParams().set('q', q).set('limit', String(limit));
    return lastValueFrom(
      this.httpClient.get<{ cedula: string; nombre_completo: string }[]>(
        `${this.baseUrl}`,
        { params, withCredentials: true }
      )
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

  //OBTENER INFORMACION DE SERVICIO POR ORDINS
  //router.get("/:servicioOrdIns", checkToken, getServicioByOrdIns);
  getInfoServicioByOrdId(ord_ins: number): Promise<Iclientes> {
    return lastValueFrom(
      this.httpClient.get<Iclientes>(`${this.baseUrl}/${ord_ins}`, {
        withCredentials: true,
      })
    );
  }
}
