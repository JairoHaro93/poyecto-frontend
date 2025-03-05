export interface Iclientes_mapa {
  cedula: string;
  nombre_completo: string;
  servicios: [
    {
      orden_instalacion: number;

      coordenadas: string;

      deuda: number;
      meses_deuda: number;
      enlace: string;
      ip: string;
    }
  ];
}
