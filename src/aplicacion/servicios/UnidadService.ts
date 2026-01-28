import { IUnidadRepository } from '../../dominio/repositorios/IUnidadRepository';
import { Unidad } from '../../dominio/entidades/Unidad';

/**
 * Servicio de aplicación para operaciones con Unidades
 */
export class UnidadService {
  constructor(private readonly unidadRepository: IUnidadRepository) {}

  /**
   * Lista todas las unidades
   */
  async listUnidades(): Promise<Unidad[]> {
    try {
      const unidades = await this.unidadRepository.list();
      return unidades;
    } catch (error) {
      throw new Error('Error al obtener unidades');
    }
  }
}
