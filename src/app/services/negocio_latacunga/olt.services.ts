// src/app/services/negocio_latacunga/olt.services.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface OntOpticalInfo {
  available: boolean;
  reason?: string;
  rxDbm: number | null;
  txDbm: number | null;
  oltRxDbm: number | null;
}

export interface OntInfoBySnResponse {
  ok: boolean;
  cmdId: 'ONT_INFO_BY_SN';
  sn: string;

  fsp: string | null;
  ontId: number | null;
  runState: string | null;

  description: string | null;
  ontLastDistanceM: number | null;

  lastDownCause: string | null;
  lastUpTime: string | null;
  lastDownTime: string | null;
  lastDyingGaspTime: string | null;
  onlineDuration: string | null;

  optical?: OntOpticalInfo;

  error?: any;
}

@Injectable({ providedIn: 'root' })
export class OltService {
  private baseUrl = `${environment.API_URL}/olt`;

  constructor(private http: HttpClient) {}

  // ✅ siempre incluye potencia
  ontInfoBySn(snHex16: string) {
    return this.http.post<OntInfoBySnResponse>(
      `${this.baseUrl}/exec`,
      {
        cmdId: 'ONT_INFO_BY_SN',
        args: { sn: snHex16, includeOptical: true },
      },
      { withCredentials: true },
    );
  }
}
