import { IResolvers } from '@graphql-tools/utils';
import { RecursoService } from '../../../aplicacion/servicios/RecursoService';
import { RecursosActivosFijosFilters } from '../../../dominio/entidades/Recurso';

/**
 * Resolver de recursos - Servicio que consume recursos activos fijos del monolito
 */
export class RecursoResolver {
  constructor(private readonly recursoService: RecursoService) {}

  /**
   * Genera resolvers GraphQL para recursos
   */
  getResolvers(): IResolvers {
    return {
      Query: {
        listRecursosActivosFijos: async (
          _: unknown,
          args: { input?: RecursosActivosFijosFilters }
        ) => {
          const input = args?.input || {};
          try {
            const result = await this.recursoService.getRecursosActivosFijos(input);
            return result;
          } catch (error) {
            // En lugar de usar ErrorHandler.handleError que lanza excepciones,
            // devolver una respuesta válida para evitar que GraphQL falle
            console.error('Error en listRecursosActivosFijos:', error);
            return {
              info: {
                page: input.page || 1,
                pages: 0,
                itemsPage: input.itemsPage || 20,
                total: 0
              },
              status: false,
              message: error instanceof Error ? error.message : 'Error desconocido',
              recursos: []
            };
          }
        },

        getRecursoActivoFijo: async (
          _: unknown,
          args: { id: string }
        ) => {
          try {
            const result = await this.recursoService.getRecursoActivoFijoById(args.id);
            return result;
          } catch (error) {
            console.error('Error en getRecursoActivoFijo:', error);
            return null; // Devolver null en lugar de error para campos opcionales
          }
        },

        listAllRecursos: async (
          _: unknown,
          args: { activoFijo?: boolean; searchTerm?: string }
        ) => {
          try {
            const result = await this.recursoService.getAllRecursos(args.activoFijo, args.searchTerm);
            return result;
          } catch (error) {
            console.error('Error en listAllRecursos:', error);
            // Devolver array vacío en lugar de error para mantener compatibilidad
            return [];
          }
        }
      },

      Mutation: {
        createRecursosFromOffline: async (
          _: unknown,
          args: { recursos: Array<{
            tempId: string;
            nombre: string;
            descripcion: string;
            precio_actual: number;
            unidad_id: string;
            clasificacion_recurso_id: string;
            tipo_recurso_id: string;
            tipo_costo_recurso_id: string;
            vigente: boolean;
            activo_fijo: boolean;
            usado: boolean;
          }> }
        ) => {
          try {
            return await this.recursoService.createRecursosFromOffline(args.recursos);
          } catch (error) {
            console.error('Error en createRecursosFromOffline resolver:', error);
            throw new Error("No se pudieron crear los recursos offline");
          }
        },

        updateEstadoRecursoAlmacen: async (
          _: unknown,
          args: { idRecurso: string; estadoRecursoAlmacen: string }
        ) => {
          try {
            return await this.recursoService.updateEstadoRecursoAlmacen(
              args.idRecurso,
              args.estadoRecursoAlmacen
            );
          } catch (error) {
            console.error('Error en updateEstadoRecursoAlmacen resolver:', error);
            throw new Error("No se pudo actualizar el estado del recurso en almacén");
          }
        }
      }
    };
  }
}
