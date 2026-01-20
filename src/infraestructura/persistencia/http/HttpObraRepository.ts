import { BaseHttpRepository } from './BaseHttpRepository';
import { Obra } from '../../../dominio/entidades/Obra';
import { IObraRepository } from '../../../dominio/repositorios/IObraRepository';

/**
 * Repositorio HTTP para operaciones con Obras
 * Consume datos del servicio inacons-backend
 */
export class HttpObraRepository extends BaseHttpRepository<Obra> implements IObraRepository {

  protected getDefaultSearchFields(): string[] {
    return ['nombre', 'titulo'];
  }

  /**
   * Lista todas las obras
   */
  async list(): Promise<Obra[]> {
    try {
      const query = `
      query ListObras {
        listObras {
          titulo
          nombre
          descripcion
          ubicacion
          direccion
          estado
          id_proyecto
          _id
        }
      }
    `;

      const response = await this.graphqlRequest(query, {}, 'inacons-backend', 'inacons-backend');

      if (!response?.listObras) {
        throw new Error('Respuesta inválida del monolito: listObras no encontrado');
      }

      // Transformar la respuesta para que coincida con la interfaz Obra
      const obras = response.listObras.map((obra: {
        titulo: string;
        nombre: string;
        descripcion: string;
        ubicacion: string;
        direccion: string;
        estado: string;
        id_proyecto: string;
        _id: string;
      }) => ({
        _id: obra._id,
        nombre: obra.nombre,
        titulo: obra.titulo,
        id_proyecto: obra.id_proyecto,
        empresa_id: undefined
      }));

      return obras;

    } catch (error) {
      throw error;
    }
  }
}
