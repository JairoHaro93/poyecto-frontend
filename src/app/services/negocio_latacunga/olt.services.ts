// src/services/negocio_latacunga/olt.services.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  cmdId: string;
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
  raw?: string;
  rawOpt?: string;
}

export interface ServicePortDeleted {
  index?: number;
  vlanId?: number;
  state?: string;
  success?: boolean;
  warning?: string;
}

export interface ServicePortFailed {
  index: number;
  error: string;
}

export interface OntDeleteResponse {
  ok: boolean;
  cmdId: string;
  message: string;
  sn: string;
  fsp: string;
  ontId: number;
  description: string | null;
  wasOnline: boolean;
  warning?: string;
  servicePorts: {
    deleted: ServicePortDeleted[];
    failed: ServicePortFailed[];
  };
  rawInfo?: string;
  rawSp?: string;
  rawDelete?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OltService {
  private baseUrl = `${environment.API_URL}/api/olt`;

  constructor(private http: HttpClient) {}

  ontInfoBySn(
    sn: string,
    includeOptical: boolean = true,
  ): Observable<OntInfoBySnResponse> {
    return this.http.post<OntInfoBySnResponse>(`${this.baseUrl}/exec`, {
      cmdId: 'ONT_INFO_BY_SN',
      args: { sn, includeOptical },
    });
  }

  ontDelete(sn: string): Observable<OntDeleteResponse> {
    return this.http.post<OntDeleteResponse>(`${this.baseUrl}/exec`, {
      cmdId: 'ONT_DELETE',
      args: { sn },
    });
  }
}
