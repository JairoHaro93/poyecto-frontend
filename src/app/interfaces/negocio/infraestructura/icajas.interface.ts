export interface ICajas {
  id: number;
  caja_nombre: string;
  caja_tipo: 'PON' | 'NAP' | string;
  caja_estado: 'DISEÑO' | 'ACTIVO' | string;
  caja_hilo?: string;
  caja_coordenadas?: string | null;
  caja_ciudad?: 'LATACUNGA' | 'SALCEDO' | string;

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
