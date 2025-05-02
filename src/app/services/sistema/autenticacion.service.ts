import { HttpClient } from '@angular/common/http';
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
