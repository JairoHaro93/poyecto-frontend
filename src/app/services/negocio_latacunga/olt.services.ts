import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface OltTestResponse {
  ok: boolean;
  message?: string;
  time?: string | null; // ✅ viene del backend
  raw?: string; // ✅ solo si debug=true
  error?: any; // backend manda { error: { message } }
}

@Injectable({ providedIn: 'root' })
export class OltService {
  private baseUrl = `${environment.API_URL}/olt`;

  constructor(private http: HttpClient) {}

  testConnection(debug = false) {
    const params: any = {};
    if (debug) params.debug = 'true';

    return this.http.get<OltTestResponse>(`${this.baseUrl}/test`, {
      withCredentials: true,
      params,
    });
  }
}
