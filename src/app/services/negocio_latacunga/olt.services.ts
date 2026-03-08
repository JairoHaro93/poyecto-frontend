import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OltMeta {
  id: number;
  nombre: string | null;
  ip: string | null;
  vendor?: string | null;
  ciudad?: string | null;
  sucursalId?: number | null;
}

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
  olt?: OltMeta | null;
  error?: any;
  raw?: string;
}

export interface OntInfoBySnResponse {
  ok: boolean;
  cmdId: string;
  sn: string;
  snLabel?: string | null;
  snInput?: string | null;
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
  olt?: OltMeta | null;
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
  cmdId?: string;
  message?: string;
  sn: string;
  snLabel?: string;
  snInput?: string;
  fsp?: string;
  ontId?: number;
  description?: string | null;
  wasOnline?: boolean;
  warning?: string;
  servicePorts?: {
    deleted: ServicePortDeleted[];
    failed: ServicePortFailed[];
  };
  localControl?: {
    found: boolean;
    released: boolean;
    onu: string | null;
    ord_ins: number | null;
    nap_id: number | null;
    puerto: number | null;
    message: string | null;
  };
  olt?: {
    id?: number;
    nombre?: string;
    ip?: string;
    vendor?: string;
    ciudad?: string;
    sucursalId?: number;
  };
}

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
  olt?: OltMeta | null;
  raw?: string;
}

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
  snLabel?: string | null;
  snInput?: string | null;
  fsp: string;
  ontId: number;
  desc: string;
  vlan: number;
  gemport: number;
  eth: number;
  traffic: { inbound: number; outbound: number };
  servicePorts: ServicePortInfo[];
  profiles?: { line: string; srv: string };
  ontType?: string | null;
  olt?: OltMeta | null;
  rawAdd?: string;
  rawNative?: string;
  rawSpCreate?: string;
  rawSpList?: string;
}

@Injectable({ providedIn: 'root' })
export class OltService {
  private baseUrl = `${environment.API_URL}/olt`;

  constructor(private http: HttpClient) {}

  ready(oltId: number): Observable<OltReadyResponse> {
    return this.http.get<OltReadyResponse>(`${this.baseUrl}/ready`, {
      params: { oltId: String(oltId) },
      withCredentials: true,
    });
  }

  status(oltId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/status`, {
      params: { oltId: String(oltId) },
      withCredentials: true,
    });
  }

  testTime(oltId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test`, {
      params: { oltId: String(oltId) },
      withCredentials: true,
    });
  }

  close(oltId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/close`,
      { oltId },
      { withCredentials: true },
    );
  }

  ontInfoBySn(
    oltId: number,
    sn: string,
    includeOptical: boolean = true,
  ): Observable<OntInfoBySnResponse> {
    return this.http.post<OntInfoBySnResponse>(
      `${this.baseUrl}/exec`,
      {
        cmdId: 'ONT_INFO_BY_SN',
        args: { oltId, sn, includeOptical },
      },
      { withCredentials: true },
    );
  }

  ontDelete(
    oltId: number,
    sn: string,
    motivoLiberacion?: string | null,
    observacionLiberacion?: string | null,
  ) {
    return this.http.post<OntDeleteResponse>(
      `${this.baseUrl}/exec`,
      {
        oltId,
        cmdId: 'ONT_DELETE',
        args: {
          sn,
          motivoLiberacion: motivoLiberacion ?? null,
          observacionLiberacion: observacionLiberacion ?? null,
        },
      },
      { withCredentials: true },
    );
  }
  ontAutofindAll(oltId: number): Observable<OntAutofindAllResponse> {
    return this.http.post<OntAutofindAllResponse>(
      `${this.baseUrl}/exec`,
      {
        cmdId: 'ONT_AUTOFIND_ALL',
        args: { oltId },
      },
      { withCredentials: true },
    );
  }

  ontProvisionAutofind(
    oltId: number,
    sn: string,
    desc: string,
    trafficIn: number,
    trafficOut: number,
    ontType?: string,
  ): Observable<OntProvisionAutofindResponse> {
    return this.http.post<OntProvisionAutofindResponse>(
      `${this.baseUrl}/exec`,
      {
        cmdId: 'ONT_PROVISION_AUTOFIND',
        args: { oltId, sn, desc, trafficIn, trafficOut, ontType },
      },
      { withCredentials: true },
    );
  }

  ontNextFreeIdByFsp(
    oltId: number,
    fsp: string,
  ): Observable<{
    ok: boolean;
    cmdId: string;
    fsp: string;
    range: { min: number; max: number };
    usedCount: number;
    usedIds?: number[];
    freeId: number | null;
    olt?: OltMeta | null;
    rawList?: string;
  }> {
    return this.http.post<any>(
      `${this.baseUrl}/exec`,
      {
        cmdId: 'ONT_NEXT_FREE_ID',
        args: { oltId, fsp },
      },
      { withCredentials: true },
    );
  }

  ontNextFreeIdByPort(
    oltId: number,
    f: number,
    s: number,
    pon: number,
  ): Observable<{
    ok: boolean;
    cmdId: string;
    fsp: string;
    range: { min: number; max: number };
    usedCount: number;
    usedIds?: number[];
    freeId: number | null;
    olt?: OltMeta | null;
    rawList?: string;
  }> {
    return this.http.post<any>(
      `${this.baseUrl}/exec`,
      {
        cmdId: 'ONT_NEXT_FREE_ID',
        args: { oltId, f, s, pon },
      },
      { withCredentials: true },
    );
  }
}
