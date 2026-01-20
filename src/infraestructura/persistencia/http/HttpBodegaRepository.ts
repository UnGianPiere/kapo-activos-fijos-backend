import { BaseHttpRepository } from './BaseHttpRepository';
import { Bodega } from '../../../dominio/entidades/Bodega';
import { IBodegaRepository } from '../../../dominio/repositorios/IBodegaRepository';

/**
 * Repositorio HTTP para operaciones con Bodegas
 * Consume datos del servicio inacons-backend
 */
export class HttpBodegaRepository extends BaseHttpRepository<Bodega> implements IBodegaRepository {

  protected getDefaultSearchFields(): string[] {
    return ['nombre', 'codigo'];
  }

  /**
   * Lista todas las bodegas
   */
  async list(): Promise<Bodega[]> {
    const query = `
      query ListObraBodegas {
        listObraBodegas {
          id
          codigo
          nombre
          obra_id {
            id
            nombre
          }
        }
      }
    `;

    const response = await this.graphqlRequest(query, {}, 'inacons-backend', 'inacons-backend');

    // Transformar la respuesta para que coincida con la interfaz Bodega
    return response.listObraBodegas.map((bodega: {
      id: string;
      codigo: string;
      nombre: string;
      obra_id: {
        id: string;
        nombre: string;
      };
    }) => ({
      _id: bodega.id,
      codigo: bodega.codigo,
      nombre: bodega.nombre,
      obra_id: bodega.obra_id.id
    }));
  }
}
