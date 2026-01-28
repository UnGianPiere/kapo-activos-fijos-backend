import { IResolvers } from '@graphql-tools/utils';
import { UnidadService } from '../../../aplicacion/servicios/UnidadService';

/**
 * Resolver de unidades - Servicio que consume del monolito
 */
export class UnidadResolver {
  constructor(private readonly unidadService: UnidadService) {}

  /**
   * Genera resolvers GraphQL para unidades
   */
  getResolvers(): IResolvers {
    return {
      Query: {
        listUnidad: async () => {
          try {
            const result = await this.unidadService.listUnidades();
            return result;
          } catch (error) {
            throw error;
          }
        }
      }
    };
  }
}
