// ============================================================================
// ENTIDADES RECURSOS - Tipos para consumo GraphQL del monolito
// ============================================================================

export interface ImagenRecurso {
  id: string;
  file: string;
  fecha: string;
}

export interface Unidad {
  id?: string;
  nombre?: string;
  unidad_id?: string;
}

export interface TipoRecurso {
  id?: string;
  nombre?: string;
}

export interface TipoCostoRecurso {
  id?: string;
  nombre?: string;
  codigo?: string;
}

export interface ClasificacionRecurso {
  id?: string;
  nombre?: string;
}

export interface Recurso {
  id: string;
  recurso_id: string;
  codigo?: string;
  nombre: string;
  descripcion: string;
  fecha?: string;
  cantidad: number;
  unidad_id?: string;
  unidad?: Unidad;
  precio_actual?: number;
  vigente?: boolean;
  tipo_recurso_id?: string;
  tipo_recurso?: TipoRecurso;
  tipo_recurso_nombre?: string;
  tipo_costo_recurso_id?: string;
  tipo_costo_recurso?: TipoCostoRecurso;
  clasificacion_recurso_id?: string;
  clasificacion_recurso?: ClasificacionRecurso;
  activo_fijo: boolean;
  usado: boolean;
  imagenes?: ImagenRecurso[];
  combustible_ids?: string[];
  estado_activo_fijo?: string;
  fecha_checked_activo_fijo?: string;
  estado_recurso_almacen?: string;
}

export interface RecursosPaginationInfo {
  page: number;
  pages: number;
  itemsPage: number;
  total: number;
}

export interface RecursosPaginationResponse {
  info: RecursosPaginationInfo;
  status: boolean;
  message: string;
  recursos: Recurso[];
}

export interface RecursosActivosFijosFilters {
  page?: number;
  itemsPage?: number;
  searchTerm?: string;
  estado_activo_fijo?: string;
  activo_fijo?: boolean;
}
