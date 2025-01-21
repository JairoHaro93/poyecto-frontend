import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode, JwtPayload } from 'jwt-decode';
//tipados
type LoginBody = { usuario: string; passwprd: string };
type ResponseLogin = { message: string; token: string };
interface CustomPayload extends JwtPayload {
  usuario_id: number;
  usuario_usuario: string;
  usuario_rol: [];
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

  datosLogged() {
    const token = localStorage.getItem('token_proyecto');

    const data = jwtDecode<CustomPayload>(token!);

    // Asegurarse de que usuario_rol sea un array de strings

    return data;
  }
}
