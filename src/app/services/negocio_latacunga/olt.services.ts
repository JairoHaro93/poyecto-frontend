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

export interface OltReadyResponse {
  ok: boolean;
  ready: boolean;
  message?: string;
  time?: string | null;
  status?: any;
  error?: any;
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

/** ====== NUEVO: AUTOFIND ====== */
export interface OntAutofindAllItem {
  number: number;
  fsp: string;
  snHex: string;
  snLabel: string;
  snRaw: string;
  ontEquipmentId?: string;
  ontSoftwareVersion?: string;
  autofindTime?: string;
}

export interface OntAutofindAllResponse {
  ok: boolean;
  cmdId: string;
  total: number;
  items: OntAutofindAllItem[];
  raw?: string;
}

/** ====== NUEVO: PROVISION ====== */
export interface ServicePortInfo {
  index: number;
  vlanId: number;
  fsp: string;
  ontId: number;
  gemIndex: number;
  state: string;
}

export interface OntProvisionAutofindResponse {
  ok: boolean;
  cmdId: string;
  sn: string;
  fsp: string;
  ontId: number;
  desc: string;
  vlan: number;
  gemport: number;
  eth: number;
  traffic: { inbound: number; outbound: number };
  servicePorts: ServicePortInfo[];
  profiles?: { line: string; srv: string };
  ontType?: string;
  rawAdd?: string;
  rawNative?: string;
  rawSpCreate?: string;
  rawSpList?: string;
}

@Injectable({ providedIn: 'root' })
export class OltService {
  private baseUrl = `${environment.API_URL}/olt`;

  constructor(private http: HttpClient) {}

  ready(): Observable<OltReadyResponse> {
    return this.http.get<OltReadyResponse>(`${this.baseUrl}/ready`, {
      withCredentials: true,
    });
  }

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

  // ✅ NUEVO
  ontAutofindAll(): Observable<OntAutofindAllResponse> {
    return this.http.post<OntAutofindAllResponse>(`${this.baseUrl}/exec`, {
      cmdId: 'ONT_AUTOFIND_ALL',
      args: {},
    });
  }

  // ✅ NUEVO
  ontProvisionAutofind(
    sn: string,
    desc: string,
    trafficIn: number,
    trafficOut: number,
  ): Observable<OntProvisionAutofindResponse> {
    return this.http.post<OntProvisionAutofindResponse>(
      `${this.baseUrl}/exec`,
      {
        cmdId: 'ONT_PROVISION_AUTOFIND',
        args: { sn, desc, trafficIn, trafficOut },
      },
    );
  }
}
