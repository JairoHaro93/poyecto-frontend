// src/app/core/models/images.ts
export interface ImageItem {
  id: number;
  tag: string; // '' si no hay tag
  position: number; // orden dentro del tag
  filename: string;
  ruta_relativa: string;
  url: string; // úsalo directo en <img [src]>
  mimetype: string;
  size: number;
  created_at: string; // ISO
}

export interface ImageListResponse {
  ok: boolean;
  module: string;
  entity_id: string;
  imagenes: ImageItem[];
}
export interface UploadResponse {
  ok: boolean;
  module: string;
  entity_id: string;
  tag: string;
  position: number;
  file_id: number;
  filename: string;
  ruta_relativa: string;
  url: string;
  size: number;
  mimetype: string;
  created_at: string;
}
