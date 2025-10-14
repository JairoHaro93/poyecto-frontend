// ruta.interface.ts
export interface IRuta {
  id: number;
  nombre: string;
  // Para empezar: GeoJSON LineString simple
  coordinates: { lat: number; lng: number }[];
  estado?: string;
  fibra_tipo?: string;
}
