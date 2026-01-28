import { ClasificacionRecurso } from '../entidades/ClasificacionRecurso';

/**
 * Interfaz para el repositorio de Clasificaciones de Recurso
 */
export interface IClasificacionRecursoRepository {
  /**
   * Lista todas las clasificaciones de recurso
   */
  list(): Promise<ClasificacionRecurso[]>;
  
  /**
   * Lista clasificaciones por parent_id
   */
  listByParentId(parentId: string): Promise<ClasificacionRecurso[]>;
}
