import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
//tipados
type LoginBody = { usuario: string; passwprd: string };
type ResponseLogin = { message: string; token: string };

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
}
