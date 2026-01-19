import { BaseHttpRepository } from './BaseHttpRepository';
import {
  ActivoFijo,
  ActivosFijosPaginationInput,
  ActivosFijosPaginationResult
} from '../../../dominio/entidades/ActivoFijo';

/**
 * Repositorio HTTP para operaciones con Activos Fijos
 * Consume datos del servicio inacons-backend
 */
export class HttpActivoFijoRepository extends BaseHttpRepository<ActivoFijo> {

  /**
   * Lista activos fijos con paginación
   */
  async listActivosFijosPaginados(input: ActivosFijosPaginationInput): Promise<ActivosFijosPaginationResult> {
    const query = `
      query ListAlmacenActivosFijoPaginado(
        $page: Int
        $itemsPage: Int
        $searchTerm: String
        $filterRangeDate: FilterRangeDateInput
      ) {
        ListAlmacenActivosFijoPaginado(
          page: $page
          itemsPage: $itemsPage
          searchTerm: $searchTerm
          filterRangeDate: $filterRangeDate
        ) {
          info {
            page
            itemsPage
            total
            pages
          }
          status
          message
          almacenActivosFijos {
            id_recurso
            codigo_recurso
            nombre_recurso
            cantidad_recurso
            costo_recurso
            id_bodega
            codigo_bodega
            nombre_bodega
            id_obra
            nombre_obra
            id_proyecto
            nombre_proyecto
            id_empresa
            nombre_empresa
            unidad_recurso_id
            unidad_recurso_nombre
            descripcion_recurso
            fecha_recurso
            vigente_recurso
            usado_recurso
            tipo_recurso_id
            clasificacion_recurso_id
            estado_recurso_almacen
          }
        }
      }
    `;

    const variables = {
      page: input.page || 1,
      itemsPage: input.itemsPage || 20,
      searchTerm: input.searchTerm,
      filterRangeDate: input.filterRangeDate
    };

    const response = await this.graphqlRequest(
      query,
      variables,
      'inacons-backend',
      'inacons-backend'
    );

    return response.ListAlmacenActivosFijoPaginado;
  }

  /**
   * Implementación abstracta: lista todos los activos fijos (sin paginación)
   */
  async list(): Promise<ActivoFijo[]> {
    const result = await this.listActivosFijosPaginados({
      page: 1,
      itemsPage: 1000 // Obtener máximo posible
    });

    return result.almacenActivosFijos;
  }

  /**
   * Campos por defecto para búsqueda
   */
  protected getDefaultSearchFields(): string[] {
    return ['codigo_recurso', 'nombre_recurso', 'codigo_bodega', 'nombre_bodega'];
  }
}
