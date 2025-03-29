import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Isoportes } from '../../interfaces/negocio/soportes/isoportes.interface';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SoportesService {
  //variables
  private baseUrl: string = `${environment.API_URL}/soportes`;

  //injectables
  private httpClient = inject(HttpClient);

  //metodos
  getAll() {
    return lastValueFrom(this.httpClient.get<Isoportes[]>(this.baseUrl));
  }

  getAllPendientes() {
    return lastValueFrom(
      this.httpClient.get<Isoportes[]>(`${this.baseUrl}/pendientes`)
    );
  }

  getAllAsignarTecnicos() {
    return lastValueFrom(
      this.httpClient.get<Isoportes[]>(`${this.baseUrl}/listar-tecnico`)
    );
  }

  getbyId(id_sop: number): Promise<Isoportes> {
    return firstValueFrom(
      this.httpClient.get<Isoportes>(`${this.baseUrl}/${id_sop}`)
    );
  }

  getbyNocId(noc_id: string) {
    return firstValueFrom(
      this.httpClient.get<Isoportes[]>(`${this.baseUrl}/mis-soportes/${noc_id}`)
    );
  }

  insert(body: Isoportes): Promise<Isoportes> {
    return firstValueFrom(this.httpClient.post<Isoportes>(this.baseUrl, body));
  }

  aceptarSoporte(ord_ins: number, body: any): Promise<any> {
    console.log(`${this.baseUrl}/${ord_ins}`, body);
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/${ord_ins}`, body)
    );
  }

  actualizarSopEstado(soporteId: number, body: any): Promise<any> {
    console.log(
      `Actualizando Estado en soporte: ${this.baseUrl}/mis-soportes/solucion/${soporteId}`,
      body
    );

    return firstValueFrom(
      this.httpClient.put<any>(
        `${this.baseUrl}/mis-soportes/solucion/${soporteId}`,
        body
      )
    );
  }

  actualizarTecnicoAsignado(id: string, body: any): Promise<any> {
    console.log(
      `Actualizando Tecnico en soporte: ${this.baseUrl}/asignar-tecnico/${id}`,
      body
    );

    return firstValueFrom(
      this.httpClient.put<any>(
        `${this.baseUrl}/asignar-tecnico/${id}`, // ✅ Fixed endpoint typo
        body
      )
    );
  }
}
