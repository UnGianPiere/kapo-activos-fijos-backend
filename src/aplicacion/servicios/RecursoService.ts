import { HttpRecursoRepository } from '../../infraestructura/persistencia/http/HttpRecursoRepository';
import {
  Recurso,
  RecursosPaginationResponse,
  RecursosActivosFijosFilters
} from '../../dominio/entidades/Recurso';
import { Logger } from '../../infraestructura/logging/Logger';

/**
 * Servicio de aplicación para operaciones con Recursos
 * Implementa la lógica de negocio y coordina con el repositorio HTTP
 */
export class RecursoService {
  private logger: Logger;

  constructor(private readonly recursoRepository: HttpRecursoRepository) {
    this.logger = Logger.getInstance();
  }

  /**
   * Lista recursos activos fijos con paginación y filtros
   */
  async getRecursosActivosFijos(
    filters: RecursosActivosFijosFilters = {}
  ): Promise<RecursosPaginationResponse> {
    try {
      // Log comentado para reducir ruido en terminal
      // this.logger.info('RecursoService: Obteniendo recursos activos fijos', { filters });

      const result = await this.recursoRepository.listRecursosActivosFijosPaginados(filters);

      // Log comentado para reducir ruido en terminal
      // this.logger.info('RecursoService: Recursos obtenidos exitosamente', {
      //   total: result.recursos?.length || 0,
      //   totalRecords: result.info?.total || 0
      // });

      return result;

    } catch (error) {
      this.logger.error('RecursoService: Error obteniendo recursos activos fijos', {
        error: error instanceof Error ? error.message : String(error),
        filters
      });
      throw error;
    }
  }

  /**
   * Obtiene un recurso activo fijo por ID
   */
  async getRecursoActivoFijoById(id: string): Promise<Recurso | null> {
    try {
      // Log comentado para reducir ruido en terminal
      // this.logger.info('RecursoService: Obteniendo recurso activo fijo por ID', { id });

      const recurso = await this.recursoRepository.getRecursoActivoFijoById(id);

      if (!recurso) {
        this.logger.warn('RecursoService: Recurso activo fijo no encontrado', { id });
        return null;
      }

      // Log comentado para reducir ruido en terminal
      // this.logger.info('RecursoService: Recurso activo fijo obtenido', {
      //   id,
      //   nombre: recurso.nombre
      // });

      return recurso;

    } catch (error) {
      this.logger.error('RecursoService: Error obteniendo recurso activo fijo por ID', {
        id,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Lista todos los recursos con filtros opcionales (sin paginación)
   */
  async getAllRecursos(activoFijo?: boolean, searchTerm?: string): Promise<Recurso[]> {
    try {
      // Log comentado para reducir ruido en terminal
      // this.logger.info('RecursoService: Obteniendo todos los recursos', { activoFijo, searchTerm });

      const recursos = await this.recursoRepository.listAllRecursos(activoFijo, searchTerm);

      // Log comentado para reducir ruido en terminal
      // this.logger.info('RecursoService: Recursos obtenidos exitosamente', {
      //   count: recursos.length,
      //   activoFijo,
      //   searchTerm
      // });

      return recursos;

    } catch (error) {
      this.logger.error('RecursoService: Error obteniendo todos los recursos', {
        error: error instanceof Error ? error.message : String(error),
        activoFijo,
        searchTerm
      });
      throw error;
    }
  }

  /**
   * Actualiza el estado de un recurso en almacén
   */
  async updateEstadoRecursoAlmacen(
    idRecurso: string,
    estadoRecursoAlmacen: string
  ): Promise<Recurso> {
    try {
      // Log comentado para reducir ruido en terminal
      // this.logger.info('RecursoService: Actualizando estado de recurso en almacén', {
      //   idRecurso,
      //   estadoRecursoAlmacen
      // });

      const mutation = `
        mutation UpdateEstadoRecursoAlmacen($id_recurso: ID!, $estado_recurso_almacen: String!) {
          updateEstadoRecursoAlmacen(
            id_recurso: $id_recurso
            estado_recurso_almacen: $estado_recurso_almacen
          ) {
            id
            estado_recurso_almacen
            codigo
            nombre
          }
        }
      `;

      const response = await this.recursoRepository.executeGraphQLMutation<{
        updateEstadoRecursoAlmacen: Recurso
      }>(mutation, {
        id_recurso: idRecurso,
        estado_recurso_almacen: estadoRecursoAlmacen
      });

      // Log comentado para reducir ruido en terminal
      // this.logger.info('RecursoService: Estado de recurso actualizado exitosamente', {
      //   idRecurso,
      //   estadoRecursoAlmacen
      // });

      return response.updateEstadoRecursoAlmacen;

    } catch (error) {
      this.logger.error('RecursoService: Error actualizando estado de recurso en almacén', {
        idRecurso,
        estadoRecursoAlmacen,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}
