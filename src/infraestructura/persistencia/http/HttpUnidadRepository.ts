import { BaseHttpRepository } from './BaseHttpRepository';
import { Unidad } from '../../../dominio/entidades/Unidad';
import { IUnidadRepository } from '../../../dominio/repositorios/IUnidadRepository';

/**
 * Repositorio HTTP para operaciones con Unidades
 * Consume datos del servicio inacons-backend
 */
export class HttpUnidadRepository extends BaseHttpRepository<Unidad> implements IUnidadRepository {

  protected getDefaultSearchFields(): string[] {
    return ['nombre', 'descripcion'];
  }

  /**
   * Lista todas las unidades
   */
  async list(): Promise<Unidad[]> {
    try {
      const query = `
      query ListUnidad {
        listUnidad {
          id
          unidad_id
          nombre
          descripcion
        }
      }
    `;

      const response = await this.graphqlRequest(query, {}, 'inacons-backend', 'inacons-backend');

      if (!response?.listUnidad) {
        throw new Error('Respuesta inválida del monolito: listUnidad no encontrado');
      }

      // Transformar la respuesta para que coincida con la interfaz Unidad
      const unidades = response.listUnidad.map((unidad: {
        id: string;
        unidad_id: string;
        nombre: string;
        descripcion: string;
      }) => ({
        id: unidad.id,
        unidad_id: unidad.unidad_id,
        nombre: unidad.nombre,
        descripcion: unidad.descripcion
      }));

      return unidades;

    } catch (error) {
      throw error;
    }
  }
}
