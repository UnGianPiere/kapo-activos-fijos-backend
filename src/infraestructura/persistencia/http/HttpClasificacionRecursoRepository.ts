import { BaseHttpRepository } from './BaseHttpRepository';
import { ClasificacionRecurso } from '../../../dominio/entidades/ClasificacionRecurso';
import { IClasificacionRecursoRepository } from '../../../dominio/repositorios/IClasificacionRecursoRepository';

/**
 * Repositorio HTTP para operaciones con Clasificaciones de Recurso
 * Consume datos del servicio inacons-backend
 */
export class HttpClasificacionRecursoRepository extends BaseHttpRepository<ClasificacionRecurso> implements IClasificacionRecursoRepository {

  protected getDefaultSearchFields(): string[] {
    return ['nombre'];
  }

  /**
   * Lista todas las clasificaciones de recurso
   */
  async list(): Promise<ClasificacionRecurso[]> {
    try {
      const query = `
      query ListClasificacionRecurso {
        listClasificacionRecurso {
          id
          nombre
          parent_id
          childs {
            id
            nombre
            parent_id
            childs {
              id
              nombre
              parent_id
            }
          }
        }
      }
    `;

      const response = await this.graphqlRequest(query, {}, 'inacons-backend', 'inacons-backend');

      if (!response?.listClasificacionRecurso) {
        throw new Error('Respuesta inválida del monolito: listClasificacionRecurso no encontrado');
      }

      // Transformar la respuesta para que coincida con la interfaz ClasificacionRecurso
      const clasificaciones = response.listClasificacionRecurso.map((clasificacion: any) => ({
        id: clasificacion.id,
        nombre: clasificacion.nombre,
        parent_id: clasificacion.parent_id || null,
        childs: clasificacion.childs ? clasificacion.childs.map((child: any) => ({
          id: child.id,
          nombre: child.nombre,
          parent_id: child.parent_id || null,
          childs: child.childs ? child.childs.map((grandchild: any) => ({
            id: grandchild.id,
            nombre: grandchild.nombre,
            parent_id: grandchild.parent_id || null
          })) : undefined
        })) : undefined
      }));

      return clasificaciones;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Lista clasificaciones por parent_id
   */
  async listByParentId(parentId: string): Promise<ClasificacionRecurso[]> {
    try {
      const query = `
      query ListClasificacionRecursoByParentId($parentId: ID!) {
        listClasificacionRecursoByParentId(parentId: $parentId) {
          id
          nombre
          parent_id
          childs {
            id
            nombre
            parent_id
          }
        }
      }
    `;

      const response = await this.graphqlRequest(
        query, 
        { parentId }, 
        'inacons-backend', 
        'inacons-backend'
      );

      if (!response?.listClasificacionRecursoByParentId) {
        throw new Error('Respuesta inválida del monolito: listClasificacionRecursoByParentId no encontrado');
      }

      // Transformar la respuesta
      const clasificaciones = response.listClasificacionRecursoByParentId.map((clasificacion: any) => ({
        id: clasificacion.id,
        nombre: clasificacion.nombre,
        parent_id: clasificacion.parent_id || null,
        childs: clasificacion.childs ? clasificacion.childs.map((child: any) => ({
          id: child.id,
          nombre: child.nombre,
          parent_id: child.parent_id || null
        })) : undefined
      }));

      return clasificaciones;

    } catch (error) {
      throw error;
    }
  }
}
