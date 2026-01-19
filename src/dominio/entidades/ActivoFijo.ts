/**
 * Entidad de dominio para Activo Fijo
 * Representa un activo fijo almacenado en bodegas
 */
export interface ActivoFijo {
  id_recurso: string;
  codigo_recurso: string;
  nombre_recurso: string;
  cantidad_recurso: number;
  costo_recurso: number;
  id_bodega: string;
  codigo_bodega: string;
  nombre_bodega: string;
  id_obra: string;
  nombre_obra: string;
  id_proyecto: string;
  nombre_proyecto: string;
  id_empresa: string;
  nombre_empresa: string;
  unidad_recurso_id?: string;
  unidad_recurso_nombre?: string;
  descripcion_recurso?: string;
  fecha_recurso?: string;
  vigente_recurso: boolean;
  usado_recurso: boolean;
  tipo_recurso_id?: string;
  clasificacion_recurso_id?: string;
  estado_recurso_almacen?: string;
}

/**
 * Filtros para búsqueda de activos fijos
 */
export interface ActivosFijosFilter {
  searchTerm?: string;
  filterRangeDate?: {
    fecha_desde?: string;
    fecha_hasta?: string;
  };
}

/**
 * Input de paginación para activos fijos
 */
export interface ActivosFijosPaginationInput {
  page?: number;
  itemsPage?: number;
  searchTerm?: string;
  filterRangeDate?: {
    fecha_desde?: string;
    fecha_hasta?: string;
  };
}

/**
 * Respuesta de paginación de activos fijos
 */
export interface ActivosFijosPaginationResult {
  info: {
    page: number;
    itemsPage: number;
    total: number;
    pages: number;
  };
  status: boolean;
  message: string;
  almacenActivosFijos: ActivoFijo[];
}
