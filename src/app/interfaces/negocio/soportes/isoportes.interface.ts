export interface Isoportes {
  id: number;
  ord_ins: string;
  reg_sop_coment_cliente: string;
  reg_sop_tel: string;
  reg_sop_opc: number;
  reg_sop_registrado_por_id: string;
  reg_sop_registrado_por_nombre: string;
  reg_sop_fecha: Date;
  reg_sop_fecha_acepta: Date;
  reg_sop_nombre: string;
  reg_sop_estado: string;
  reg_sop_tec_asignado: number;
  nombre_tecnico: string;
  reg_sop_noc_id_acepta: number;
  reg_sop_aceptado_por_nombre: string;
  reg_sop_sol_det: string;
  reg_sop_coordenadas: string;

  // 🔽 Datos que se enriquecen desde SQL Server (batch endpoint)
  clienteCedula?: string;
  clienteNombre?: string;
  clienteDireccion?: string;
  clienteTelefonos?: string;
  clientePlan?: string;
  clienteIP?: string;
}
