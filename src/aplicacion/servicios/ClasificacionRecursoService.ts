import { IClasificacionRecursoRepository } from '../../dominio/repositorios/IClasificacionRecursoRepository';
import { ClasificacionRecurso } from '../../dominio/entidades/ClasificacionRecurso';

/**
 * Servicio de aplicación para operaciones con Clasificaciones de Recurso
 */
export class ClasificacionRecursoService {
  constructor(private readonly clasificacionRecursoRepository: IClasificacionRecursoRepository) {}

  /**
   * Lista todas las clasificaciones de recurso
   */
  async listClasificaciones(): Promise<ClasificacionRecurso[]> {
    try {
      const clasificaciones = await this.clasificacionRecursoRepository.list();
      return clasificaciones;
    } catch (error) {
      throw new Error('Error al obtener clasificaciones de recurso');
    }
  }

  /**
   * Lista clasificaciones por parent_id
   */
  async listClasificacionesByParentId(parentId: string): Promise<ClasificacionRecurso[]> {
    try {
      const clasificaciones = await this.clasificacionRecursoRepository.listByParentId(parentId);
      return clasificaciones;
    } catch (error) {
      throw new Error('Error al obtener clasificaciones por parent_id');
    }
  }
}
