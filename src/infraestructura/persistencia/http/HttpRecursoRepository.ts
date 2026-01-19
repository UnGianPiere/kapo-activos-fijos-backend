import { BaseHttpRepository } from './BaseHttpRepository';
import {
  Recurso,
  RecursosPaginationResponse,
  RecursosActivosFijosFilters
} from '../../../dominio/entidades/Recurso';

/**
 * Repositorio HTTP para operaciones con Recursos
 * Consume datos del servicio inacons-backend
 */
export class HttpRecursoRepository extends BaseHttpRepository<Recurso> {

  /**
   * Lista recursos activos fijos con paginación y filtros
   */
  async listRecursosActivosFijosPaginados(
    filters: RecursosActivosFijosFilters
  ): Promise<RecursosPaginationResponse> {
    const query = `
      query ListRecursosActivosFijos(
        $page: Int
        $itemsPage: Int
        $searchTerm: String
        $estado_activo_fijo: String
        $activo_fijo: Boolean
      ) {
        listRecursoPagination(
          page: $page
          itemsPage: $itemsPage
          searchTerm: $searchTerm
          estado_activo_fijo: $estado_activo_fijo
          activo_fijo: $activo_fijo
        ) {
          info {
            page
            pages
            itemsPage
            total
          }
          status
          message
          recursos {
            id
            recurso_id
            codigo
            nombre
            descripcion
            cantidad
            unidad_id
            unidad {
              nombre
            }
            precio_actual
            tipo_recurso_id
            tipo_recurso {
              nombre
            }
            tipo_costo_recurso_id
            tipo_costo_recurso {
              nombre
              codigo
            }
            clasificacion_recurso_id
            clasificacion_recurso {
              nombre
            }
            fecha
            vigente
            usado
            imagenes {
              id
              file
            }
            activo_fijo
            combustible_ids
            estado_activo_fijo
            fecha_checked_activo_fijo
          }
        }
      }
    `;

    const variables = {
      page: filters.page || 1,
      itemsPage: filters.itemsPage || 20,
      searchTerm: filters.searchTerm || '',
      estado_activo_fijo: filters.estado_activo_fijo || '',
      activo_fijo: filters.activo_fijo !== undefined ? filters.activo_fijo : true
    };

      const result = await this.graphqlRequest(query, variables, '', 'inacons-backend');

      if (result && result.listRecursoPagination) {
        const response = result.listRecursoPagination;

        // Limpiar campos null de objetos anidados
        if (response.recursos && Array.isArray(response.recursos)) {
          response.recursos = response.recursos.map((recurso: any) => {
            // Manejar unidad
            if (recurso.unidad === null || (recurso.unidad && Object.keys(recurso.unidad).length === 0)) {
              recurso.unidad = null;
            } else if (recurso.unidad) {
              if (recurso.unidad.id === null) {
                delete recurso.unidad.id;
              }
            }

            // Manejar tipo_recurso
            if (recurso.tipo_recurso && recurso.tipo_recurso.id === null) {
              delete recurso.tipo_recurso.id;
            }

            // Manejar tipo_costo_recurso
            if (recurso.tipo_costo_recurso && recurso.tipo_costo_recurso.id === null) {
              delete recurso.tipo_costo_recurso.id;
            }

            // Manejar clasificacion_recurso
            if (recurso.clasificacion_recurso && recurso.clasificacion_recurso.id === null) {
              delete recurso.clasificacion_recurso.id;
            }

            return recurso;
          });

          // Filtrar recursos con tipo_costo_recurso_id inválido
          const recursosAntesFiltro = response.recursos.length;
          response.recursos = response.recursos.filter((recurso: any) => {
            if (recurso === null || recurso === undefined) {
              return false;
            }

            const tipoCostoRecursoId = recurso.tipo_costo_recurso_id;
            if (tipoCostoRecursoId === null ||
                tipoCostoRecursoId === undefined ||
                tipoCostoRecursoId === '--Elige--' ||
                tipoCostoRecursoId === '' ||
                (typeof tipoCostoRecursoId === 'string' && tipoCostoRecursoId.trim() === '--Elige--')) {
              return false;
            }

            return true;
          });

          // Actualizar el total en info para reflejar solo los recursos válidos
          if (response.info && recursosAntesFiltro !== response.recursos.length) {
            response.info.total = response.recursos.length;
            response.info.pages = Math.max(1, Math.ceil(response.recursos.length / (response.info.itemsPage || 20)));
          }
        }

        return response;
      }

      // Si no hay respuesta válida, devolver estructura por defecto
      return {
        info: {
          page: filters.page || 1,
          pages: 0,
          itemsPage: filters.itemsPage || 20,
          total: 0
        },
        status: false,
        message: 'No se encontraron recursos',
        recursos: []
      };
  }

  /**
   * Lista todos los recursos con filtros opcionales (sin paginación)
   */
  async listAllRecursos(activoFijo?: boolean, searchTerm?: string): Promise<Recurso[]> {
    const query = `
      query ListAllRecursos($activo_fijo: Boolean, $searchTerm: String) {
        listRecurso(activo_fijo: $activo_fijo, searchTerm: $searchTerm) {
          id
          recurso_id
          codigo
          nombre
          descripcion
          fecha
          cantidad
          unidad_id
          unidad {
            nombre
          }
          precio_actual
          vigente
          tipo_recurso_id
          tipo_recurso {
            nombre
          }
          tipo_recurso_nombre
          tipo_costo_recurso_id
          tipo_costo_recurso {
            nombre
            codigo
          }
          clasificacion_recurso_id
          clasificacion_recurso {
            nombre
          }
          activo_fijo
          usado
          imagenes {
            id
            file
            fecha
          }
          combustible_ids
          estado_activo_fijo
          fecha_checked_activo_fijo
        }
      }
    `;

    const variables: any = {};
    if (activoFijo !== undefined) {
      variables.activo_fijo = activoFijo;
    }
    if (searchTerm && searchTerm.trim()) {
      variables.searchTerm = searchTerm.trim();
    }

    const result = await this.graphqlRequest(query, variables, '', 'inacons-backend');

    if (result && result.listRecurso) {
      return result.listRecurso;
    }

    return [];
  }

  /**
   * Obtiene un recurso activo fijo por ID
   */
  async getRecursoActivoFijoById(id: string): Promise<Recurso | null> {
    const query = `
      query GetRecursoById($id: ID!) {
        getRecurso(id: $id) {
          id
          recurso_id
          codigo
          nombre
          descripcion
          fecha
          cantidad
          unidad_id
          unidad {
            id
            nombre
          }
          precio_actual
          vigente
          tipo_recurso_id
          tipo_recurso {
            id
            nombre
          }
          tipo_recurso_nombre
          tipo_costo_recurso_id
          tipo_costo_recurso {
            id
            nombre
          }
          clasificacion_recurso_id
          clasificacion_recurso {
            id
            nombre
          }
          activo_fijo
          usado
          imagenes {
            id
            file
            fecha
          }
          combustible_ids
          estado_activo_fijo
          fecha_checked_activo_fijo
        }
      }
    `;

    const response = await this.graphqlRequest(query, { id }, '', 'inacons-backend');
    const recurso = response.getRecurso;

    // Verificar que sea activo fijo
    if (!recurso?.activo_fijo) {
      return null;
    }

    return recurso;
  }

  /**
   * Ejecuta una consulta GraphQL al monolito
   */
  async executeGraphQLMutation<T>(mutation: string, variables: any): Promise<T> {
    return await this.graphqlRequest(mutation, variables, 'inacons-backend', 'inacons-backend');
  }

  // Implementación requerida por BaseHttpRepository (no usada en este caso)
  async list(): Promise<Recurso[]> {
    // Este método no se usa ya que tenemos consultas específicas
    // pero es requerido por la clase base
    throw new Error('Use listRecursosActivosFijosPaginados instead');
  }

  protected getDefaultSearchFields(): string[] {
    return ['codigo', 'nombre'];
  }
}
