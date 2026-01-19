import { IResolvers } from '@graphql-tools/utils';
import { ReporteActivoFijoService } from '../../../aplicacion/servicios/ReporteActivoFijoService';
import { ReporteActivoFijo } from '../../../dominio/entidades/ReporteActivoFijo';
import { ErrorHandler } from './ErrorHandler';
import { ReporteActivoFijoModel } from '../../persistencia/mongo/schemas/ReporteActivoFijoSchema';
import { PaginationFilterInput, FilterInput, Pagination } from '../../../dominio/valueObjects/Pagination';

export class ReporteActivoFijoResolver {
  constructor(private readonly reporteService: ReporteActivoFijoService) {}

  getResolvers(): IResolvers {
    return {
      Query: {
        listReportesActivosFijos: async () => {
          return await ErrorHandler.handleError(
            async () => {
              const reportes = await this.reporteService.obtenerTodos();
              // Obtener todos los _id en batch
              const idsMap = await this.getMongoIdsBatch(reportes.map(r => r.id_reporte));
              // Mapear incluyendo el _id de MongoDB
              return reportes.map(reporte => ({
                ...reporte,
                _id: idsMap.get(reporte.id_reporte) || null
              }));
            },
            'listReportesActivosFijos'
          );
        },
        getReporteActivoFijo: async (_: any, { id }: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => {
              const reporte = await this.reporteService.obtenerPorId(id);
              if (!reporte) return null;
              return {
                ...reporte,
                _id: await this.getMongoIdAsync(reporte.id_reporte)
              };
            },
            'getReporteActivoFijo',
            { id }
          );
        },
        getReporteActivoFijoPorId: async (_: any, { id_reporte }: { id_reporte: string }) => {
          return await ErrorHandler.handleError(
            async () => {
              const reporte = await this.reporteService.obtenerPorIdReporte(id_reporte);
              if (!reporte) return null;
              return {
                ...reporte,
                _id: await this.getMongoIdAsync(reporte.id_reporte)
              };
            },
            'getReporteActivoFijoPorId',
            { id_reporte }
          );
        },
        getReportesActivosFijosByUsuario: async (_: any, { id_usuario }: { id_usuario: string }) => {
          return await ErrorHandler.handleError(
            async () => {
              const reportes = await this.reporteService.obtenerPorUsuario(id_usuario);
              // Obtener todos los _id en batch
              const idsMap = await this.getMongoIdsBatch(reportes.map(r => r.id_reporte));
              return reportes.map(reporte => ({
                ...reporte,
                _id: idsMap.get(reporte.id_reporte) || null
              }));
            },
            'getReportesActivosFijosByUsuario',
            { id_usuario }
          );
        },
        getReportesActivosFijosByRecurso: async (_: any, { id_recurso }: { id_recurso: string }) => {
          return await ErrorHandler.handleError(
            async () => {
              const { reportes } = await this.reporteService.obtenerReportesPorRecurso(id_recurso);
              // Obtener todos los _id en batch
              const idsMap = await this.getMongoIdsBatch(reportes.map(r => r.id_reporte));
              return reportes.map(reporte => ({
                ...reporte,
                _id: idsMap.get(reporte.id_reporte) || null
              }));
            },
            'getReportesActivosFijosByRecurso',
            { id_recurso }
          );
        },
        getHistorialRecurso: async (_: any, { id_recurso }: { id_recurso: string }) => {
          return await ErrorHandler.handleError(
            async () => {
              return await this.reporteService.obtenerHistorialRecurso(id_recurso);
            },
            'getHistorialRecurso',
            { id_recurso }
          );
        },
        estadisticasReportes: async () => {
          return await ErrorHandler.handleError(
            async () => {
              return await this.reporteService.obtenerEstadisticas();
            },
            'estadisticasReportes'
          );
        },
        listReportesActivosFijosPaginated: async (_: any, { input }: { input: PaginationFilterInput }) => {
          return await ErrorHandler.handleError(
            async () => {
              // Convertir input de GraphQL al formato del servicio
              const serviceInput = this.convertGraphQLInputToServiceInput(input);
              const { page = 1, limit = 10 } = serviceInput;

              // Para simplificar, por ahora usamos paginación básica
              const { reportes, total } = await this.reporteService.listarReportes(new Pagination(page, limit));

              // Obtener todos los _id en batch
              const idsMap = await this.getMongoIdsBatch(reportes.map(r => r.id_reporte));

              return {
                data: reportes.map(reporte => ({
                  ...reporte,
                  _id: idsMap.get(reporte.id_reporte) || null
                })),
                pagination: {
                  page,
                  limit,
                  total,
                  totalPages: Math.ceil(total / limit),
                  hasNext: page * limit < total,
                  hasPrev: page > 1
                }
              };
            },
            'listReportesActivosFijosPaginated',
            { input }
          );
        },
      },
      Mutation: {
        addReporteActivoFijo: async (_: any, { titulo, usuario_id, usuario_nombre, recursos, notas_generales, esSincronizacionOffline }: any) => {

          return await ErrorHandler.handleError(
            async () => {
              const reporte = await this.reporteService.crear({
                titulo,
                usuario_id,
                usuario_nombre,
                recursos,
                notas_generales,
                esSincronizacionOffline
              });
              return {
                ...reporte,
                _id: await this.getMongoIdAsync(reporte.id_reporte)
              };
            },
            'addReporteActivoFijo',
            { titulo, usuario_id, usuario_nombre, recursos, notas_generales, esSincronizacionOffline }
          );
        },
        updateReporteActivoFijo: async (_: any, { id, titulo, recursos, notas_generales }: any) => {
          return await ErrorHandler.handleError(
            async () => {
              const reporte = await this.reporteService.actualizar(id, {
                titulo,
                recursos,
                notas_generales
              });
              if (!reporte) return null;
              return {
                ...reporte,
                _id: await this.getMongoIdAsync(reporte.id_reporte)
              };
            },
            'updateReporteActivoFijo',
            { id, titulo, recursos, notas_generales }
          );
        },
        deleteReporteActivoFijo: async (_: any, { id }: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => {
              const reporte = await this.reporteService.eliminar(id);
              if (!reporte) return null;
              return {
                ...reporte,
                _id: await this.getMongoIdAsync(reporte.id_reporte)
              };
            },
            'deleteReporteActivoFijo',
            { id }
          );
        },
      },
      ReporteActivoFijo: {
        _id: (parent: ReporteActivoFijo & { _id?: string }) => {
          // Si el _id ya está mapeado en el objeto parent, retornarlo
          if (parent._id) {
            return parent._id;
          }
          // Si no, retornar null (esto no debería pasar si mapeamos correctamente)
          return null;
        },
      },
    };
  }

  /**
   * Obtiene el _id de MongoDB de forma asíncrona para un solo reporte
   */
  private async getMongoIdAsync(id_reporte: string): Promise<string | null> {
    const doc = await ReporteActivoFijoModel.findOne({ id_reporte }).lean();
    return doc?._id?.toString() || null;
  }

  /**
   * Obtiene los _id de MongoDB en batch para múltiples reportes
   * Esto es más eficiente que hacer consultas individuales
   */
  private async getMongoIdsBatch(id_reportes: string[]): Promise<Map<string, string>> {
    if (id_reportes.length === 0) {
      return new Map();
    }
    const docs = await ReporteActivoFijoModel.find({ id_reporte: { $in: id_reportes } }).lean();
    const idsMap = new Map<string, string>();
    docs.forEach(doc => {
      if (doc._id && doc.id_reporte) {
        idsMap.set(doc.id_reporte, doc._id.toString());
      }
    });
    return idsMap;
  }

  /**
   * Convierte el input de GraphQL al formato esperado por el servicio
   * GraphQL usa array de FilterInput con field, value, operator
   * El servicio espera un objeto plano con claves como campos
   */
  private convertGraphQLInputToServiceInput(input?: any): PaginationFilterInput {
    if (!input) {
      return {};
    }

    const result: PaginationFilterInput = {};

    // Convertir paginación
    if (input.pagination) {
      result.page = input.pagination.page;
      result.limit = input.pagination.limit;
      result.sortBy = input.pagination.sortBy;
      result.sortOrder = input.pagination.sortOrder === 'asc' ? 'asc' : 'desc';
    }

    // Convertir filtros de GraphQL (array) a formato del servicio (objeto plano)
    if (input.filters && Array.isArray(input.filters)) {
      const filters: FilterInput = {};
      input.filters.forEach((filter: any) => {
        if (filter.field && filter.value !== undefined) {
          if (filter.operator && filter.operator !== 'eq') {
            filters[filter.field] = {
              operator: filter.operator,
              value: filter.value
            };
          } else {
            filters[filter.field] = filter.value;
          }
        }
      });
      result.filters = filters;
    }

    // Convertir búsqueda
    if (input.search) {
      result.search = input.search;
    }

    return result;
  }
}
