// caja.interface.ts  (o .../icajas.interface.ts)
export interface ICajas {
  id: number;
  caja_nombre: string;
  caja_tipo: string;
  caja_estado: string;
  caja_hilo?: string;
  caja_coordenadas?: string; // "lat,lng" (ej: "-0.934521,-78.615834")
}
