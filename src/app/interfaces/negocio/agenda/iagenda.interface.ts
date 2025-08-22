export interface Iagenda {
  id: number;
  age_tipo: string;
  ord_ins: string;
  age_id_tipo: string;
  age_id_sop: string;
  age_coordenadas: string;
  age_hora_inicio: string;
  age_hora_fin: string;
  age_fecha: string;
  age_vehiculo: string;
  age_tecnico: number;
  nombre_completo?: string;
  reg_sop_tec_asignado: number;
  age_diagnostico: string;
  age_telefono: string;
  age_solucion: string;
  age_estado: string;

  // Enriquecidos
  clienteCedula?: string;
  clienteNombre?: string;
  clienteDireccion?: string;
  clienteTelefonos?: string;
  clientePlan?: string;
  clienteIP?: string;
}
