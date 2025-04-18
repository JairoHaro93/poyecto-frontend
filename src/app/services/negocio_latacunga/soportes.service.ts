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

  //GETTERS GENERALES

  // OBTIENE TODOS LOS SOPORTES
  getAll(): Promise<Isoportes[]> {
    try {
      return lastValueFrom(this.httpClient.get<Isoportes[]>(this.baseUrl));
    } catch (error) {
      console.error('Error al obtener todos los soportes:', error);
      throw error;
    }
  }

  // OBTIENE LOS SOPORTES PENDIENTES
  getAllPendientes(): Promise<Isoportes[]> {
    try {
      return lastValueFrom(
        this.httpClient.get<Isoportes[]>(`${this.baseUrl}/pendientes`)
      );
    } catch (error) {
      console.error('Error al obtener soportes pendientes:', error);
      throw error;
    }
  }

  //OBTIENE UN SOPORTE POR ID DE SOPORTE
  getSopById(id_sop: number): Promise<Isoportes> {
    try {
      console.log(`${this.baseUrl}/${id_sop}`);
      return firstValueFrom(
        this.httpClient.get<Isoportes>(`${this.baseUrl}/${id_sop}`)
      );
    } catch (error) {
      console.error(`Error al obtener soporte con ID ${id_sop}:`, error);
      throw error;
    }
  }

  //NOC RECIBE LA INFORMACION DE LOS SOPORTES ACEPTADOS
  getSopByNocId(id_noc: string): Promise<Isoportes[]> {
    try {
      return firstValueFrom(
        this.httpClient.get<Isoportes[]>(
          `${this.baseUrl}/mis-soportes/${id_noc}`
        )
      );
    } catch (error) {
      console.error(`Error al obtener soportes del usuario ${id_noc}:`, error);
      throw error;
    }
  }

  //CREA UN SOPORTE
  createSop(body: Isoportes): Promise<Isoportes> {
    try {
      return firstValueFrom(
        this.httpClient.post<Isoportes>(this.baseUrl, body)
      );
    } catch (error) {
      console.error('Error al insertar soporte:', error);
      throw error;
    }
  }

  //NOC ACEPTA Y ACTUALIZA LA TABLA CON SU USUARIO Y HORA DE ACEPTACION
  aceptarSoporte(id_sop: number, body: any): Promise<any> {
    try {
      console.log(`Aceptando soporte: ${this.baseUrl}/${id_sop}`, body);
      return firstValueFrom(
        this.httpClient.put<any>(`${this.baseUrl}/${id_sop}`, body)
      );
    } catch (error) {
      console.error(`Error al aceptar soporte con orden ${id_sop}:`, error);
      throw error;
    }
  }

  //NOC ACTUALIZA LA TABLA SOLUCION
  actualizarEstadoSop(id_sop: string, body: any): Promise<any> {
    try {
      console.log(
        `Actualizando Estado en soporte: ${this.baseUrl}/mis-soportes/solucion/${id_sop}`,
        body
      );
      return firstValueFrom(
        this.httpClient.put<any>(
          `${this.baseUrl}/mis-soportes/solucion/${id_sop}`,
          body
        )
      );
    } catch (error) {
      console.error(`Error al actualizar estado del soporte ${id_sop}:`, error);
      throw error;
    }
  }
}
