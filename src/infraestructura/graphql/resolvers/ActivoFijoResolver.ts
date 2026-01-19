import { IResolvers } from '@graphql-tools/utils';
import { ActivoFijoService } from '../../../aplicacion/servicios/ActivoFijoService';
import { ActivosFijosPaginationInput } from '../../../dominio/entidades/ActivoFijo';
import { ErrorHandler } from './ErrorHandler';

/**
 * Resolver de activos fijos - Servicio específico que consume del monolito
 */
export class ActivoFijoResolver {
  constructor(private readonly activoFijoService: ActivoFijoService) {}

  /**
   * Genera resolvers GraphQL para activos fijos
   */
  getResolvers(): IResolvers {
    return {
      Query: {
        listActivosFijosPaginados: async (
          _: unknown,
          args: { input?: ActivosFijosPaginationInput }
        ) => {
          const input = args?.input || {};
          return await ErrorHandler.handleError(
            async () => await this.activoFijoService.listActivosFijosPaginados(input),
            'listActivosFijosPaginados',
            input as Record<string, unknown>
          );
        }
      }
    };
  }
}
