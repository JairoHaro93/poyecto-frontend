// src/app/interfaces/sistema/iusuarios.interface.ts
export interface Iusuarios {
  id?: number;
  nombre: string;
  apellido: string;
  ci: string;
  usuario: string;
  password: string;
  fecha_nac: Date;
  fecha_cont: Date;
  genero: string;
  rol: string[];

  // 🔹 Nuevos campos
  sucursal_id?: number | null;
  sucursal_codigo?: string | null;
  sucursal_nombre?: string | null;

  departamento_id?: number | null;
  departamento_codigo?: string | null;
  departamento_nombre?: string | null;
}
