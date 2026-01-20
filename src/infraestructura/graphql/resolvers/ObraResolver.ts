import { IResolvers } from '@graphql-tools/utils';
import { ObraService } from '../../../aplicacion/servicios/ObraService';

/**
 * Resolver de obras - Servicio específico que consume del monolito
 */
export class ObraResolver {
  constructor(private readonly obraService: ObraService) {}

  /**
   * Genera resolvers GraphQL para obras
   */
  getResolvers(): IResolvers {
    return {
      Query: {
        listObras: async () => {
          try {
            const result = await this.obraService.listObras();
            return result;
          } catch (error) {
            throw error;
          }
        }
      }
    };
  }
}