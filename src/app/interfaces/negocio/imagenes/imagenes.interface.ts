export interface IImagen {
  ruta: string;
  url: string;
}

export interface IVisConImagenes {
  id: number;
  vis_tipo: string;
  vis_estado: string;
  vis_diagnostico: string;
  vis_coment_cliente: string;
  vis_solucion: string | null;
  fecha_actualizacion: string;
  imagenes: {
    [campo: string]: IImagen;
  };
}
