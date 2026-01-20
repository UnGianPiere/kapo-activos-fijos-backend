import { Bodega } from '../entidades/Bodega';

/**
 * Interfaz para el repositorio de Bodegas
 */
export interface IBodegaRepository {
  /**
   * Lista todas las bodegas
   */
  list(): Promise<Bodega[]>;
}
