// src/app/interfaces/sistema/isucursal.interface.ts
export interface ISucursal {
  id: number;
  codigo: string;
  nombre: string;

  // Opcionales, si los tienes en la tabla
  ciudad?: string | null;
  direccion?: string | null;
  activo?: number | boolean;
}
