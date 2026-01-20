import { Obra } from '../entidades/Obra';

/**
 * Interfaz para el repositorio de Obras
 */
export interface IObraRepository {
  /**
   * Lista todas las obras
   */
  list(): Promise<Obra[]>;
}
