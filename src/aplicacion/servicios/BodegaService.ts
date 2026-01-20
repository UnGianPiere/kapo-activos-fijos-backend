import { IBodegaRepository } from '../../dominio/repositorios/IBodegaRepository';
import { Bodega } from '../../dominio/entidades/Bodega';

/**
 * Servicio de aplicación para operaciones con Bodegas
 */
export class BodegaService {
  constructor(private readonly bodegaRepository: IBodegaRepository) {}

  /**
   * Lista todas las bodegas
   */
  async listBodegas(): Promise<Bodega[]> {
    try {
      return await this.bodegaRepository.list();
    } catch (error) {
      console.error('Error en BodegaService.listBodegas:', error);
      throw new Error('Error al obtener bodegas');
    }
  }
}
