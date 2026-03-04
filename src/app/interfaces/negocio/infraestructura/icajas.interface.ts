export interface ICajas {
  id: number;

  caja_nombre: string;
  caja_tipo: 'PON' | 'NAP' | string;
  caja_estado: 'DISEÑO' | 'ACTIVO' | string;

  caja_ciudad?: 'LATACUNGA' | 'SALCEDO' | string | null;
  caja_hilo?: string | null;
  caja_coordenadas?: string | null;

  // NUEVOS (modelo PON/NAP)
  caja_root_split?: 2 | 8 | 16 | number | null; // R2/R8/R16
  caja_segmento?: string | null; // SEG humano
  caja_pon_id?: number | null; // solo NAP
  caja_pon_ruta?: string | null; // "5" o "7/2"

  // opcionales devueltos por el SELECT del backend
  lat?: number | string | null;
  lng?: number | string | null;
  created_at?: string;
}

export interface ApiListResp {
  success: boolean;
  message: string;
  data: ICajas[];
}
