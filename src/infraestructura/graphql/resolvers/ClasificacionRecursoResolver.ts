import { IResolvers } from '@graphql-tools/utils';
import { ClasificacionRecursoService } from '../../../aplicacion/servicios/ClasificacionRecursoService';

/**
 * Resolver de clasificaciones de recurso - Servicio que consume del monolito
 */
export class ClasificacionRecursoResolver {
  constructor(private readonly clasificacionRecursoService: ClasificacionRecursoService) {}

  /**
   * Genera resolvers GraphQL para clasificaciones de recurso
   */
  getResolvers(): IResolvers {
    return {
      Query: {
        listClasificacionRecurso: async () => {
          try {
            const result = await this.clasificacionRecursoService.listClasificaciones();
            return result;
          } catch (error) {
            throw error;
          }
        },
        listClasificacionRecursoByParentId: async (_: any, { parentId }: { parentId: string }) => {
          try {
            const result = await this.clasificacionRecursoService.listClasificacionesByParentId(parentId);
            return result;
          } catch (error) {
            throw error;
          }
        }
      }
    };
  }
}
