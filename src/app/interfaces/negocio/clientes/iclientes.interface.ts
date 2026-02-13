export interface Iclientes {
  cedula: string;
  nombre_completo: string;
  servicios: [
    {
      referencia: string;
      estado: string;
      direccion: string;
      orden_instalacion: number;
      coordenadas: string;
      deuda: number;
      meses_deuda: number;
      enlace: string;
      ip: string;
      fecha_instalacion: Date;
      instalado_por: string;
      plan_nombre: string;
      telefonos: string;
      precio: number;
      cortado: string;
      tipo: string;
      tipo_instalacion: string;
      estado_instalacion: string;
      servicio: string;
      onu: string;
      fecha_prorroga: string;
      prorroga: string;
    },
  ];
}
