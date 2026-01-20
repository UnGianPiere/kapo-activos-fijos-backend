import { IResolvers } from '@graphql-tools/utils';
import { BodegaService } from '../../../aplicacion/servicios/BodegaService';

/**
 * Resolver de bodegas - Servicio específico que consume del monolito
 */
export class BodegaResolver {
  constructor(private readonly bodegaService: BodegaService) {}

  /**
   * Genera resolvers GraphQL para bodegas
   */
  getResolvers(): IResolvers {
    return {
      Query: {
        listBodegas: async () => {
          return await this.bodegaService.listBodegas();
        }
      }
    };
  }
}
