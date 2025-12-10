// src/app/interfaces/sistema/idepartamento.interface.ts
export interface IDepartamento {
  id: number;
  codigo: string;
  nombre: string;
  sucursal_id: number;

  // Opcionales
  descripcion?: string | null;
  activo?: number | boolean;
}
