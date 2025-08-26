/*import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { jwtDecode, JwtPayload } from 'jwt-decode';
//tipados
type LoginBody = { usuario: string; password: string };
type ResponseLogin = { message: string; token: string };
interface CustomPayload extends JwtPayload {
  usuario_id: number;
  usuario_usuario: string;
  usuario_rol: [];
  usuario_nombre: string;
}
@Injectable({
  providedIn: 'root',
})
export class AutenticacionService {
  //inject
  private httpClient = inject(HttpClient);

  // Variables
  private baseUrl: string = `${environment.API_URL}`;

  login(body: LoginBody) {
    return lastValueFrom(
      this.httpClient.post<ResponseLogin>(`${this.baseUrl}/login`, body)
    );
  }

  async logout(usuario_id: number) {
    console.log(`${this.baseUrl}/login/not`, { usuario_id });
    return lastValueFrom(
      this.httpClient.post(`${this.baseUrl}/login/not`, { usuario_id })
    );
  }

  datosLogged(): any {
    const token = localStorage.getItem('token_proyecto');
    if (!token) return null;

    try {
      return jwtDecode(token); // contiene usuario_id, usuario_rol, etc.
    } catch (err) {
      return null;
    }
  }
}

*/
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Iusuarios } from '../../interfaces/sistema/iusuarios.interface';

type LoginBody = { usuario: string; password: string };

@Injectable({
  providedIn: 'root',
})
export class AutenticacionService {
  private httpClient = inject(HttpClient);
  private baseUrl: string = `${environment.API_URL}/login`;
  private usuario: Iusuarios | null = null;

  // LOGIN
  async login(body: LoginBody): Promise<void> {
    await firstValueFrom(
      this.httpClient.post(`${this.baseUrl}`, body, {
        withCredentials: true,
      })
    );

    // después del login, obtener el usuario autenticado
    this.usuario = await this.getUsuarioAutenticado();
  }

  // LOGOUT
  async logout(usuario_id: number): Promise<void> {
    await firstValueFrom(
      this.httpClient.post(
        `${this.baseUrl}/not`,
        { usuario_id },
        { withCredentials: true }
      )
    );
    this.usuario = null;
  }

  // OBTENER USUARIO AUTENTICADO
  async getUsuarioAutenticado(): Promise<Iusuarios> {
    const user = await firstValueFrom(
      this.httpClient.get<Iusuarios>(`${this.baseUrl}/me`, {
        withCredentials: true,
      })
    );
    this.usuario = user;
    return user;
  }

  // ACCEDER A DATOS EN MEMORIA
  // datosLogged(): Iusuarios | null {
  //  return this.usuario;
  // }
}
