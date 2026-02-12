import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface OltTestResponse {
  ok: boolean;
  message?: string;
  output?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class OltService {
  private baseUrl = `${environment.API_URL}/olt`;

  constructor(private http: HttpClient) {}

  testConnection() {
    // si tu backend usa cookie/JWT, deja withCredentials: true
    return this.http.get<OltTestResponse>(`${this.baseUrl}/test`, {
      withCredentials: true,
    });
  }
}
