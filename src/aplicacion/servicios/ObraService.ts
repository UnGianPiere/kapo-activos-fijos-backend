import { IObraRepository } from '../../dominio/repositorios/IObraRepository';
import { Obra } from '../../dominio/entidades/Obra';

/**
 * Servicio de aplicación para operaciones con Obras
 */
export class ObraService {
  constructor(private readonly obraRepository: IObraRepository) {}

  /**
   * Lista todas las obras
   */
  async listObras(): Promise<Obra[]> {
    try {
      const obras = await this.obraRepository.list();
      return obras;
    } catch (error) {
      throw new Error('Error al obtener obras');
    }
  }
}